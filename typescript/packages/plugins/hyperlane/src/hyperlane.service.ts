import { Tool } from "@goat-sdk/core";
import { EVMReadResult, EVMWalletClient } from "@goat-sdk/wallet-evm";
import { GithubRegistry } from "@hyperlane-xyz/registry";
import {
    ChainMetadata,
    CoreConfig,
    HookType,
    HypERC20Deployer,
    HyperlaneContractsMap,
    HyperlaneCore,
    HyperlaneCoreDeployer,
    HyperlaneFactories,
    HyperlaneIsmFactory,
    IsmType,
    MultiProvider,
    TOKEN_TYPE_TO_STANDARD,
    TokenFactories,
    WarpCoreConfig,
    WarpRouteDeployConfig,
    getTokenConnectionId,
    isCollateralTokenConfig,
    isTokenMetadata,
} from "@hyperlane-xyz/sdk";
import { ProtocolType } from "@hyperlane-xyz/utils";
import { assert } from "@hyperlane-xyz/utils";
import { ethers, utils } from "ethers";
import { EVMWalletClientSigner } from "./EVMWalletClientSigner";
import hyperlaneABI from "./abi/hyperlane.abi";
import {
    HyperlaneGetDeployedContractsParameters,
    HyperlaneGetMailboxParameters,
    HyperlaneGetTokenParameters,
    HyperlaneIsmParameters,
    HyperlaneReadMessageParameters,
    HyperlaneSendMessageParameters,
    HyperlaneValidatorParameters,
} from "./parameters";

const REGISTRY_URL = "https://github.com/hyperlane-xyz/hyperlane-registry";
const REGISTRY_PROXY_URL = "https://proxy.hyperlane.xyz";
const getMultiProvider = createMultiProviderSingleton();

interface ChainAddresses {
    warpRouter?: string;
    interchainGasPaymaster?: string;
    mailbox?: string;
    [key: string]: string | undefined;
}

interface DeployedContracts {
    warpRouter?: string;
    interchainGasPaymaster?: string;
    mailbox?: string;
    [key: string]: string | undefined;
}

function stringifyWithBigInts(obj: object, space = 2): string {
    return JSON.stringify(obj, (_, value) => (typeof value === "bigint" ? value.toString() : value), space);
}

export class HyperlaneService {

    @Tool({
        name: "hyperlane_send_message",
        description: "Send a message from one chain to another using Hyperlane",
    })
    async sendMessage(walletClient: EVMWalletClient, parameters: HyperlaneSendMessageParameters) {
        const { multiProvider, registry } = await getMultiProvider(walletClient);

        const { originChain, destinationChain, destinationAddress, message } = parameters;
        const chainAddresses = await registry.getAddresses();

        try {
            // Create HyperlaneCore instance
            const hyperlane = HyperlaneCore.fromAddressesMap(chainAddresses, multiProvider);
            const encodedMessage = utils.hexlify(utils.toUtf8Bytes(message));
            // Send the message using the SDK
            const { dispatchTx, message: dispatchedMessage } = await hyperlane.sendMessage(
                originChain,
                destinationChain,
                destinationAddress,
                encodedMessage,
            );

            // Wait for message to be indexed
            await new Promise((resolve) => setTimeout(resolve, 5000));

            // Check if message is delivered
            const isDelivered = await hyperlane.isDelivered(dispatchedMessage);

            return JSON.stringify(
                {
                    message: "Message sent successfully",
                    messageId: dispatchedMessage.id,
                    transactionHash: dispatchTx.transactionHash,
                    dispatchedMessage,
                    isDelivered,
                    originDomain: multiProvider.getDomainId(originChain),
                    destinationDomain: multiProvider.getDomainId(destinationChain),
                },
                null,
                2,
            );
        } catch (err) {
            if (err instanceof Error) {
                err.message = `Failed to send message: ${err.message}\nParameters: ${JSON.stringify(parameters, null, 2)}`;
                throw err;
            }
            throw new Error(
                `Failed to send message: ${String(err)}\nParameters: ${JSON.stringify(parameters, null, 2)}`,
            );
        }
    }

    @Tool({
        name: "hyperlane_read_message",
        description: "Check the status and content of a Hyperlane message using the origin chain name and message ID",
    })
    async readMessage(parameters: HyperlaneReadMessageParameters) {
        const { chain, messageId } = parameters;

        try {
            const { multiProvider, registry } = await getMultiProvider();
            const chainAddresses = await registry.getAddresses();

            // Create HyperlaneCore instance
            const hyperlane = HyperlaneCore.fromAddressesMap(chainAddresses, multiProvider);

            // Get the dispatch transaction that created this message
            const dispatchTx = await hyperlane.getDispatchTx(chain, messageId);

            // Parse the dispatched messages from the transaction
            const messages = hyperlane.getDispatchedMessages(dispatchTx);
            const message = messages.find((m) => m.id === messageId);

            if (!message) {
                return JSON.stringify(
                    {
                        message: "Message not found",
                        details: {
                            chain,
                            messageId,
                            reason: "No message found with this ID on the specified chain",
                        },
                    },
                    null,
                    2,
                );
            }

            // Check if message has been processed
            const isDelivered = await hyperlane.isDelivered(message);

            return JSON.stringify(
                {
                    message: isDelivered ? "Message has been delivered" : "Message is pending delivery",
                    details: {
                        id: messageId,
                        status: isDelivered ? "DELIVERED" : "PENDING",
                        chain: {
                            name: chain,
                            domainId: multiProvider.getDomainId(chain),
                        },
                        content: {
                            raw: message.message,
                            decoded: message.parsed.body,
                        },
                        metadata: {
                            sender: message.parsed.sender,
                            recipient: message.parsed.recipient,
                            nonce: message.parsed.nonce,
                            originChain: message.parsed.originChain,
                            destinationChain: message.parsed.destinationChain,
                        },
                    },
                },
                null,
                2,
            );
        } catch (err) {
            if (err instanceof Error) {
                if (err.message?.includes("No dispatch event found")) {
                    err.message = `Message not found: ${err.message}\nParameters: ${JSON.stringify({ reason: "Message may be too recent or not exist on this chain", ...parameters }, null, 2)}`;
                } else {
                    err.message = `Failed to send message: ${err.message}\nParameters: ${parameters}, null, 2)}`;
                }
                throw err;
            }
            throw new Error(
                `Failed to send message: ${String(err)}\nParameters: ${JSON.stringify(parameters, null, 2)}`,
            );
        }
    }

    @Tool({
        name: "hyperlane_get_mailbox",
        description: "Get the Hyperlane mailbox address for a specific chain",
    })
    async getMailbox(parameters: HyperlaneGetMailboxParameters) {
        const { registry } = await getMultiProvider();
        const { chain } = parameters;

        try {
            // Get addresses from registry
            const chainAddresses = await registry.getAddresses();

            // Get mailbox address for the specified chain
            const mailboxAddress = chainAddresses[chain]?.mailbox;

            if (!mailboxAddress) {
                throw new Error(`No mailbox found for chain: ${chain}`);
            }

            // Get chain metadata for additional information
            const chainMetadata = await registry.getMetadata();
            const chainInfo = chainMetadata[chain];

            return JSON.stringify(
                {
                    message: "Mailbox address retrieved successfully",
                    details: {
                        chain,
                        mailboxAddress,
                        chainInfo: {
                            name: chainInfo?.name,
                            chainId: chainInfo?.chainId,
                            domainId: chainInfo?.domainId,
                            protocol: chainInfo?.protocol,
                            rpcUrls: chainInfo?.rpcUrls,
                        },
                    },
                },
                null,
                2,
            );
        } catch (err) {
            if (err instanceof Error) {
                err.message = `Failed to retrieve mailbox address: ${err.message}\nParameters: ${JSON.stringify(parameters, null, 2)}`;
                throw err;
            }
            throw new Error(
                `Failed to retrieve mailbox address: ${String(err)}\nParameters: ${JSON.stringify(parameters, null, 2)}`,
            );
        }
    }

    @Tool({
        name: "hyperlane_get_deployed_contracts",
        description: "Get all deployed Hyperlane contract addresses for a specific chain",
    })
    async getDeployedContracts(parameters: HyperlaneGetDeployedContractsParameters) {
        const { registry } = await getMultiProvider();
        const { chain, contractType } = parameters;

        try {
            // Get addresses from registry
            const chainAddresses = await registry.getChainAddresses(chain);

            if (!chainAddresses) {
                throw new Error(`No contracts found for chain: ${chain}`);
            }

            // Get chain metadata for additional information
            const chainMetadata = await registry.getMetadata();
            const chainInfo = chainMetadata[chain];

            // Filter contracts by type if specified
            let filteredAddresses = chainAddresses;
            if (contractType) {
                filteredAddresses = Object.entries(chainAddresses)
                    .filter(([key]) => key.toLowerCase().includes(contractType.toLowerCase()))
                    .reduce((obj, [key, value]) => Object.assign(obj, { [key]: value }), {});

                if (Object.keys(filteredAddresses).length === 0) {
                    throw new Error(`No ${contractType} contracts found for chain: ${chain}`);
                }
            }

            const groupedContracts = {
                core: {} as Record<string, string>,
                ism: {} as Record<string, string>,
                hooks: {} as Record<string, string>,
                factories: {} as Record<string, string>,
                infrastructure: {} as Record<string, string>,
            };

            for (const [name, address] of Object.entries(filteredAddresses)) {
                if (name.includes("Ism") || name.includes("ism")) {
                    groupedContracts.ism[name] = address;
                } else if (name.includes("Hook")) {
                    groupedContracts.hooks[name] = address;
                } else if (name.includes("Factory")) {
                    groupedContracts.factories[name] = address;
                } else if (["mailbox", "validatorAnnounce", "proxyAdmin"].includes(name)) {
                    groupedContracts.core[name] = address;
                } else {
                    groupedContracts.infrastructure[name] = address;
                }
            }

            return JSON.stringify(
                {
                    message: "Deployed contracts retrieved successfully",
                    details: {
                        chain,
                        chainInfo: {
                            name: chainInfo?.name,
                            chainId: chainInfo?.chainId,
                            domainId: chainInfo?.domainId,
                        },
                        contracts: contractType ? filteredAddresses : groupedContracts,
                    },
                },
                null,
                2,
            );
        } catch (err) {
            if (err instanceof Error) {
                err.message = `Failed to retrieve deployed contracts: ${err.message}\nParameters: ${JSON.stringify(parameters, null, 2)}`;
                throw err;
            }
            throw new Error(
                `Failed to retrieve deployed contracts: ${String(err)}\nParameters: ${JSON.stringify(parameters, null, 2)}`,
            );
        }
    }

    @Tool({
        name: "hyperlane_configure_ism",
        description: "Configure Interchain Security Module settings",
    })
    /**
     * Configures an Interchain Security Module (ISM) for a specific blockchain chain
     *
     * @param walletClient - The Ethereum wallet client used for transaction signing
     * @param parameters - Configuration parameters for ISM deployment
     *
     * @returns A JSON string containing details of the configured ISM
     *
     * @throws {Error} If ISM configuration fails or required parameters are missing
     *
     * Supported ISM Types:
     * - merkleRootMultisigIsm: Requires validators and threshold
     * - messageIdMultisigIsm: Requires validators and threshold
     * - storageMerkleRootMultisigIsm: Requires validators and threshold
     * - storageMessageIdMultisigIsm: Requires validators and threshold
     * - weightedMerkleRootMultisigIsm: Requires validators and thresholdWeight
     * - weightedMessageIdMultisigIsm: Requires validators and thresholdWeight
     * - pausableIsm: Requires owner, optional paused state
     * - trustedRelayerIsm: Requires relayer address and mailbox
     * - opStackIsm: Requires origin and nativeBridge
     * - arbL2ToL1Ism: Requires bridge address
     * - testIsm: No additional configuration required
     */
    async configureIsm(walletClient: EVMWalletClient, parameters: HyperlaneIsmParameters) {
        const { multiProvider, registry } = await getMultiProvider(walletClient);

        try {
            const { chain, type, mailbox, config, origin, existingIsmAddress } = parameters;
            const chainAddresses = await registry.getAddresses();

            // Create ISM factory
            const ismFactory = HyperlaneIsmFactory.fromAddressesMap(chainAddresses, multiProvider);

            // biome-ignore lint/suspicious/noExplicitAny: na
            let ismConfig: any = { type };

            // Configure based on ISM type
            switch (type) {
                case "merkleRootMultisigIsm":
                case "messageIdMultisigIsm":
                case "storageMerkleRootMultisigIsm":
                case "storageMessageIdMultisigIsm":
                    if (!config.validators || !config.threshold) {
                        throw new Error("Validators and threshold required for multisig ISM");
                    }
                    ismConfig = {
                        type,
                        validators: config.validators.map((v) => v.signingAddress),
                        threshold: config.threshold,
                    };
                    break;

                case "weightedMerkleRootMultisigIsm":
                case "weightedMessageIdMultisigIsm":
                    if (!config.validators || !config.thresholdWeight) {
                        throw new Error("Validators and thresholdWeight required for weighted multisig ISM");
                    }
                    ismConfig = {
                        type,
                        validators: config.validators,
                        thresholdWeight: config.thresholdWeight,
                    };
                    break;

                case "pausableIsm":
                    if (!config.owner) {
                        throw new Error("Owner required for pausable ISM");
                    }
                    ismConfig = {
                        type,
                        owner: config.owner,
                        paused: config.paused || false,
                        ownerOverrides: config.ownerOverrides,
                    };
                    break;

                case "trustedRelayerIsm":
                    if (!config.relayer) {
                        throw new Error("Relayer address required for trusted relayer ISM");
                    }
                    if (!mailbox) {
                        throw new Error("Mailbox is required for trusted relayer ISM");
                    }
                    ismConfig = {
                        type,
                        relayer: config.relayer,
                    };
                    break;

                case "opStackIsm":
                    if (!config.origin || !config.nativeBridge) {
                        throw new Error("Origin and nativeBridge required for OP Stack ISM");
                    }
                    ismConfig = {
                        type,
                        origin: config.origin,
                        nativeBridge: config.nativeBridge,
                    };
                    break;

                case "arbL2ToL1Ism":
                    if (!config.bridge) {
                        throw new Error("Bridge address required for Arbitrum L2 to L1 ISM");
                    }
                    ismConfig = {
                        type,
                        bridge: config.bridge,
                    };
                    break;

                case "testIsm":
                    ismConfig = { type };
                    break;
            }

            // Deploy ISM
            const deployedIsm = await ismFactory.deploy({
                destination: chain,
                config: ismConfig,
                mailbox: mailbox || undefined,
                existingIsmAddress: existingIsmAddress || undefined,
                origin: origin || undefined,
            });

            return JSON.stringify(
                {
                    message: "ISM configured successfully",
                    details: {
                        chain,
                        type,
                        address: deployedIsm?.address,
                        config: ismConfig,
                    },
                },
                null,
                2,
            );
        } catch (err) {
            if (err instanceof Error) {
                err.message = `Failed to configure ISM: ${err.message}\nParameters: ${JSON.stringify(parameters, null, 2)}`;
                throw err;
            }
            throw new Error(
                `Failed to configure ISM: ${String(err)}\nParameters: ${JSON.stringify(parameters, null, 2)}`,
            );
        }
    }

    @Tool({
        name: "hyperlane_manage_validators",
        description: "Manage validator set for multisig ISM",
    })
    async manageValidators(walletClient: EVMWalletClient, parameters: HyperlaneValidatorParameters) {
        try {
            const { chain, action, validator, weight } = parameters;

            // Create transaction based on action
            // biome-ignore lint/suspicious/noExplicitAny: na
            let tx: any;

            switch (action) {
                case "ADD":
                    tx = await walletClient.sendTransaction({
                        to: validator,
                        abi: hyperlaneABI,
                        functionName: "addValidator",
                        args: [validator, weight || 1],
                        // value: 0,
                        // options: 
                        // data
                    })
                    break;
                case "REMOVE":
                    tx = await walletClient.sendTransaction({
                        to: validator,
                        abi: hyperlaneABI,
                        functionName: "removeValidator",
                        // args: [validator, weight || 1],
                        // value: 0,
                        // options: 
                        // data
                    })
                    break;
                case "UPDATE":
                    tx = await walletClient.sendTransaction({
                        to: validator,
                        abi: hyperlaneABI,
                        functionName: "updateValidatorWeight",
                        // args: [validator, weight || 1],
                        // value: 0,
                        // options: 
                        // data
                    })
                    break;
            }

            return JSON.stringify(
                {
                    message: `Validator ${action.toLowerCase()}ed successfully`,
                    details: {
                        chain,
                        action,
                        validator,
                        weight,
                        transactionHash: tx.transactionHash,
                    },
                },
                null,
                2,
            );
        } catch (err) {
            if (err instanceof Error) {
                err.message = `Failed to manage validator: ${err.message}\nParameters: ${JSON.stringify(parameters, null, 2)}`;
                throw err;
            }
            throw new Error(
                `Failed to manage validator: ${String(err)}\nParameters: ${JSON.stringify(parameters, null, 2)}`,
            );
        }
    }

    @Tool({
        name: "get_hyperlane_tokens",
        description: "Get deployed tokens on Hyperlane Warp Routes from the registry",
    })
    async getTokens(parameters: HyperlaneGetTokenParameters) {
        try {
            const { chain, tokenSymbol, standard, tokenRouterAddress } = parameters;
            // router address isn't used except in response
            const { registry } = await getMultiProvider();

            // Get warp route configs
            const warpRouteConfigs = await registry.getWarpRoutes();
            console.log("Getting warp route configs...");

            const tokens = [];

            // Iterate through all configs to find matching tokens
            for (const [routeId, config] of Object.entries(warpRouteConfigs)) {
                if (!config || !Array.isArray(config.tokens)) continue;

                for (const token of config.tokens) {
                    // Skip if doesn't match our filters
                    if (chain && token.chainName.toUpperCase() !== chain.toUpperCase()) continue;
                    if (tokenSymbol && token.symbol.toUpperCase() !== tokenSymbol.toUpperCase()) continue;
                    if (standard && token.standard.toUpperCase() !== standard.toUpperCase()) continue;
                    if (tokenRouterAddress && token.addressOrDenom?.toUpperCase() !== tokenRouterAddress.toUpperCase())
                        continue;

                    // Skip if missing required fields
                    if (
                        !token.name ||
                        !token.symbol ||
                        !token.decimals ||
                        !token.chainName ||
                        !token.standard ||
                        !token.addressOrDenom ||
                        !token.connections
                    )
                        continue;

                    tokens.push({
                        routeId,
                        name: token.name,
                        symbol: token.symbol,
                        decimals: token.decimals,
                        chainName: token.chainName,
                        standard: token.standard,
                        tokenRouterAddress: token.addressOrDenom,
                        underlyingTokenAddress: token.collateralAddressOrDenom || null,
                        connections: token.connections.map((c: { token: string }) => {
                            const [_, chainName, routerAddress] = c.token.split("|");
                            return {
                                chainName,
                                routerAddress,
                            };
                        }),
                    });
                }
            }

            return JSON.stringify(
                {
                    message: tokens.length > 0 ? "Tokens found" : "No tokens found matching criteria",
                    details: {
                        chain,
                        filters: {
                            tokenSymbol,
                            standard,
                            tokenRouterAddress,
                        },
                        tokens,
                    },
                },
                null,
                2,
            );
        } catch (err) {
            if (err instanceof Error) {
                err.message = `Failed to get tokens: ${err.message}\nParameters: ${JSON.stringify(parameters, null, 2)}`;
                throw err;
            }
            throw new Error(`Failed to get tokens: ${String(err)}\nParameters: ${JSON.stringify(parameters, null, 2)}`);
        }
    }

    private async getProvider(chain: string): Promise<ethers.providers.JsonRpcProvider> {
        const { multiProvider } = await getMultiProvider();
        const provider = multiProvider.getProvider(chain);
        // biome-ignore lint/suspicious/noExplicitAny: na
        const rpcUrl = (provider as any).connection?.url;
        if (!rpcUrl) {
            throw new Error(`Could not get RPC URL for chain ${chain}`);
        }
        return new ethers.providers.JsonRpcProvider(rpcUrl);
    }

    private async getDomainId(chain: string): Promise<number | undefined> {
        const { multiProvider } = await getMultiProvider();
        const chainConfig = multiProvider.getChainMetadata(chain);
        return chainConfig?.domainId;
    }
}

function createMultiProviderSingleton() {
    let instance: { multiProvider: MultiProvider; registry: GithubRegistry } | null = null;
    let lastRefresh: number | null = null;
    const oneDay = 86400000; // milliseconds in one day

    return async function getMultiProvider(walletClient?: EVMWalletClient) {
        const now = Date.now();

        const refresh = lastRefresh && now - lastRefresh > oneDay; // refresh daily

        if (!instance || refresh) {
            const registry = new GithubRegistry({
                uri: REGISTRY_URL,
                proxyUrl: REGISTRY_PROXY_URL,
            });
            const chainMetadata = await registry.getMetadata();
            const multiProvider = new MultiProvider<ChainMetadata>(chainMetadata);

            if (walletClient) {
                const signer = new EVMWalletClientSigner(walletClient);
                // const signer = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY as string);
                multiProvider.setSharedSigner(signer);
            }

            instance = { multiProvider, registry };
            lastRefresh = now;
        }

        return instance;
    };
}

async function getWarpCoreConfig(
    multiProvider: MultiProvider,
    warpDeployConfig: WarpRouteDeployConfig,
    contracts: HyperlaneContractsMap<TokenFactories & HyperlaneFactories>,
): Promise<WarpCoreConfig> {
    const warpCoreConfig: WarpCoreConfig = { tokens: [] };

    const tokenMetadata = await HypERC20Deployer.deriveTokenMetadata(multiProvider, warpDeployConfig);
    assert(tokenMetadata && isTokenMetadata(tokenMetadata), "Missing required token metadata");
    const { decimals, symbol, name } = tokenMetadata;
    assert(decimals, "Missing decimals on token metadata");

    generateTokenConfigs(warpCoreConfig, warpDeployConfig, contracts, symbol, name, decimals);

    fullyConnectTokens(warpCoreConfig);

    return warpCoreConfig;
}

function generateTokenConfigs(
    warpCoreConfig: WarpCoreConfig,
    warpDeployConfig: WarpRouteDeployConfig,
    contracts: HyperlaneContractsMap<TokenFactories & HyperlaneFactories>,
    symbol: string,
    name: string,
    decimals: number,
): void {
    for (const [chainName, contract] of Object.entries(contracts)) {
        const config = warpDeployConfig[chainName];
        const collateralAddressOrDenom = isCollateralTokenConfig(config) ? config.token : undefined;

        const tokenType = config.type as keyof TokenFactories;
        const tokenContract = contract[tokenType];

        if ("address" in tokenContract && typeof tokenContract.address === "string") {
            assert(tokenContract.address, "Missing token contract address");
        } else {
            throw new Error("Invalid token contract type or missing address");
        }

        warpCoreConfig.tokens.push({
            chainName,
            standard: TOKEN_TYPE_TO_STANDARD[config.type],
            decimals,
            symbol,
            name,
            addressOrDenom: tokenContract.address,
            collateralAddressOrDenom,
        });
    }
}

function fullyConnectTokens(warpCoreConfig: WarpCoreConfig): void {
    for (const token1 of warpCoreConfig.tokens) {
        for (const token2 of warpCoreConfig.tokens) {
            if (token1.chainName === token2.chainName && token1.addressOrDenom === token2.addressOrDenom) continue;
            token1.connections ||= [];
            assert(token2.addressOrDenom, "Invalid token2 address");
            token1.connections.push({
                token: getTokenConnectionId(ProtocolType.Ethereum, token2.chainName, token2.addressOrDenom),
            });
        }
    }
}
