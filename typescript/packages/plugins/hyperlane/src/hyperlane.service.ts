import { Tool } from "@goat-sdk/core";
import { EVMTransactionResult, EVMWalletClient } from "@goat-sdk/wallet-evm";
import { GithubRegistry } from "@hyperlane-xyz/registry";
import {
    ChainMetadata,
    EvmERC20WarpRouteReader,
    HyperlaneCore,
    HyperlaneIsmFactory,
    MultiProvider,
    TokenType,
} from "@hyperlane-xyz/sdk";
import { BigNumber, ethers, utils } from "ethers";
import { encodePacked } from "viem";
import { EVMWalletClientSigner } from "./EVMWalletClientSigner";
import hyperlaneABI, { transferRemoteNativeAbi, transferRemoteCollateralAbi } from "./abi/hyperlane.abi";
import {
    HyperlaneGetDeployedContractsParameters,
    HyperlaneGetMailboxParameters,
    HyperlaneGetTokenParameters,
    HyperlaneGetWarpRoutesForChainParameters,
    HyperlaneInspectWarpRouteParameters,
    HyperlaneIsmParameters,
    HyperlaneReadMessageParameters,
    HyperlaneSendAssetsParameters,
    HyperlaneSendMessageParameters,
    HyperlaneValidatorParameters,
} from "./parameters";
import { type WarpRoutes } from "./types";
import { stringifyWithBigInts } from "./utils";

let globalRefresh = false; // for manually setting a refresh to the multiProvider

export class HyperlaneService {
    getMultiProvider: (
        walletClient?: EVMWalletClient,
    ) => Promise<{ multiProvider: MultiProvider; registry: GithubRegistry }>;
    getWarpRoutes: (registry: GithubRegistry) => Promise<WarpRoutes>;

    constructor() {
        this.getMultiProvider = createMultiProviderSingleton();
        this.getWarpRoutes = createWarpRoutesSingleton();
    }

    /**
     * @method
     * @name HyperlaneService#sendMessage
     * @description Sends a message from one chain to another using Hyperlane
     * @param {EVMWalletClient} walletClient The Ethereum wallet client used for transaction signing
     * @param {HyperlaneSendMessageParameters} parameters Parameters for sending the message
     * @param {string} parameters.originChain Source chain name (e.g. "base", "arbitrum")
     * @param {string} parameters.destinationChain Target chain name (e.g. "base", "arbitrum")
     * @param {string} parameters.destinationAddress Recipient address on the destination chain
     * @param {string} parameters.message Message content to send
     * @returns {string} A JSON string with message details, delivery status, and transaction hash
     * @throws {Error} If message dispatch fails or parameters are invalid
     */
    @Tool({
        name: "hyperlane_send_message",
        description: "Send a message from one chain to another using Hyperlane",
    })
    async sendMessage(walletClient: EVMWalletClient, parameters: HyperlaneSendMessageParameters): Promise<string> {
        const { multiProvider, registry } = await this.getMultiProvider(walletClient);

        const { originChain, destinationChain, destinationAddress, message } = parameters;
        const chainAddresses = await registry.getAddresses();

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
    }

    /**
     * @method
     * @name HyperlaneService#readMessage
     * @description Reads the status and metadata of a Hyperlane message from its origin chain
     * @param {HyperlaneReadMessageParameters} parameters Parameters to locate the message
     * @param {string} parameters.chain Origin chain name where message was dispatched
     * @param {string} parameters.messageId ID of the message to look up
     * @returns {string} A JSON string containing message delivery status, content, and metadata
     * @throws {Error} If message cannot be found or inspection fails
     */
    @Tool({
        name: "hyperlane_read_message",
        description: "Check the status and content of a Hyperlane message using the origin chain name and message ID",
    })
    async readMessage(parameters: HyperlaneReadMessageParameters): Promise<string> {
        const { chain, messageId } = parameters;

        const { multiProvider, registry } = await this.getMultiProvider();
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
    }

    /**
     * @method
     * @name HyperlaneService#getMailbox
     * @description Retrieves the Hyperlane mailbox address for a specific chain
     * @param {HyperlaneGetMailboxParameters} parameters Parameters for chain lookup
     * @param {string} parameters.chain Chain name (e.g. "base", "arbitrum")
     * @returns {string} A JSON string containing the mailbox address and chain metadata
     * @throws {Error} If mailbox address cannot be retrieved
     */
    @Tool({
        name: "hyperlane_get_mailbox",
        description: "Get the Hyperlane mailbox address for a specific chain",
    })
    async getMailbox(parameters: HyperlaneGetMailboxParameters): Promise<string> {
        const { registry } = await this.getMultiProvider();
        const { chain } = parameters;

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
    }

    /**
     * @method
     * @name HyperlaneService#getDeployedContracts
     * @description Fetches deployed Hyperlane contract addresses for a specific chain
     * @param {HyperlaneGetDeployedContractsParameters} parameters Parameters for chain and filter
     * @param {string} parameters.chain Chain name to query
     * @param {string} [parameters.contractType] Optional filter for contract type (e.g. "mailbox", "ism")
     * @returns {string} A JSON string listing deployed contracts grouped by type
     * @throws {Error} If contracts cannot be fetched or none exist for the chain
     */
    @Tool({
        name: "hyperlane_get_deployed_contracts",
        description: "Get all deployed Hyperlane contract addresses for a specific chain",
    })
    async getDeployedContracts(parameters: HyperlaneGetDeployedContractsParameters): Promise<string> {
        const { registry } = await this.getMultiProvider();
        const { chain, contractType } = parameters;

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
    }

    /**
     * @method
     * @name HyperlaneService#configureISM
     * @description Configures an Interchain Security Module (ISM) for a specific blockchain chain
     * @param {EVMWalletClient} walletClient The Ethereum wallet client used for transaction signing
     * @param {HyperlaneIsmParameters} parameters Configuration parameters for ISM deployment
     * @param {string} parameters.chain Chain name (e.g. "base", "arbitrum").
     * @param {"merkleRootMultisigIsm"|"messageIdMultisigIsm"|"storageMerkleRootMultisigIsm"|"storageMessageIdMultisigIsm"|"weightedMerkleRootMultisigIsm"|"weightedMessageIdMultisigIsm"|"pausableIsm"|"trustedRelayerIsm"|"testIsm"|"opStackIsm"|"arbL2ToL1Ism"} parameters.type Type of ISM to configure.
     *      - merkleRootMultisigIsm: Requires validators and threshold
     *      - messageIdMultisigIsm: Requires validators and threshold
     *      - storageMerkleRootMultisigIsm: Requires validators and threshold
     *      - storageMessageIdMultisigIsm: Requires validators and threshold
     *      - weightedMerkleRootMultisigIsm: Requires validators and thresholdWeight
     *      - weightedMessageIdMultisigIsm: Requires validators and thresholdWeight
     *      - pausableIsm: Requires owner, optional paused state
     *      - trustedRelayerIsm: Requires relayer address and mailbox
     *      - opStackIsm: Requires origin and nativeBridge
     *      - arbL2ToL1Ism: Requires bridge address
     *      - testIsm: No additional configuration required
     * @param {Object} parameters.config ISM configuration options.
     * @param {Array<{signingAddress: string, weight?: number}>} [parameters.config.validators] array of validator configs.
     * @param {number} [parameters.config.threshold] minimum number of validators required.
     * @param {number} [parameters.config.thresholdWeight] minimum total validator weight required.
     * @param {string} [parameters.config.owner] owner address for the ISM.
     * @param {boolean} [parameters.config.paused] paused state.
     * @param {Record<string, string>} [parameters.config.ownerOverrides] owner override mapping.
     * @param {string} [parameters.config.relayer] relayer address.
     * @param {string} [parameters.config.origin] origin chain identifier.
     * @param {string} [parameters.config.nativeBridge] native bridge address.
     * @param {string} [parameters.config.bridge] bridge address.
     * @param {string} [parameters.mailbox] Mailbox address.
     * @param {string} [parameters.origin] Origin chain.
     * @param {string} [parameters.existingIsmAddress] Existing ISM address to use instead of deploying a new one.
     * @returns {string} A JSON string containing details of the configured ISM
     * @throws {Error} If ISM configuration fails or required parameters are missing
     */
    @Tool({
        name: "hyperlane_configure_ism",
        description: "Configure Interchain Security Module settings",
    })
    async configureIsm(walletClient: EVMWalletClient, parameters: HyperlaneIsmParameters): Promise<string> {
        const { multiProvider, registry } = await this.getMultiProvider(walletClient);

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
    }

    /**
     * @method
     * @name HyperlaneService#manageValidators
     * @description Adds, removes, or updates a validator in a multisig ISM validator set
     * @param {EVMWalletClient} walletClient The wallet client used to send transactions
     * @param {HyperlaneValidatorParameters} parameters Parameters to manage validator
     * @param {string} parameters.chain Target chain
     * @param {"ADD"|"REMOVE"|"UPDATE"} parameters.action Validator management action
     * @param {string} parameters.validator Validator address
     * @param {number} [parameters.weight] Validator weight (only for weighted ISMs)
     * @returns {string} A JSON string with the transaction hash and action result
     * @throws {Error} If transaction fails or input is invalid
     */
    @Tool({
        name: "hyperlane_manage_validators",
        description: "Manage validator set for multisig ISM",
    })
    async manageValidators(walletClient: EVMWalletClient, parameters: HyperlaneValidatorParameters): Promise<string> {
        const { chain, action, validator, weight } = parameters;

        // Create transaction based on action
        let tx: EVMTransactionResult;

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
                });
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
                });
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
                });
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
    }

    /**
     * @method
     * @name HyperlaneService#getTokens
     * @description Retrieves tokens deployed on Hyperlane Warp Routes, with optional filters
     * @param {HyperlaneGetTokenParameters} parameters Parameters for filtering tokens
     * @param {string} parameters.chain Chain name (e.g. "base", "arbitrum")
     * @param {string} [parameters.tokenSymbol] Token symbol filter (e.g. "USDC")
     * @param {string} [parameters.standard] Token standard filter (e.g. "EvmHypSynthetic")
     * @param {string} [parameters.tokenRouterAddress] Specific token router address
     * @returns {string} A JSON string containing matching token info
     * @throws {Error} If token lookup fails
     */
    @Tool({
        name: "get_hyperlane_tokens",
        description: "Get deployed tokens on Hyperlane Warp Routes from the registry",
    })
    async getTokens(parameters: HyperlaneGetTokenParameters): Promise<string> {
        const { chain, tokenSymbol, standard, tokenRouterAddress } = parameters;
        // router address isn't used except in response
        const { registry } = await this.getMultiProvider();

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
    }

    /**
     * @method
     * @name HyperlaneService#inspectWarpRoute
     * @description Inspects a Warp Route to retrieve token config, metadata, and ISM settings
     * @param {EVMWalletClient} walletClient Wallet client for cross-chain access
     * @param {HyperlaneInspectWarpRouteParameters} parameters Warp Route parameters
     * @param {string} parameters.warpRouteAddress Address of the warp route to inspect
     * @param {string} parameters.chain Chain where the warp route is deployed
     * @returns {string} A JSON string containing route metadata, token config, mailbox config, and remote routers
     * @throws {Error} If inspection fails
     */
    @Tool({
        name: "hyperlane_inspect_warp_route",
        description: "Inspect a WarpRoute to retrieve config, token info, and ISM settings",
    })
    async inspectWarpRoute(
        walletClient: EVMWalletClient,
        parameters: HyperlaneInspectWarpRouteParameters,
    ): Promise<string> {
        const { warpRouteAddress, chain } = parameters;
        const { multiProvider } = await this.getMultiProvider(walletClient);

        const reader = new EvmERC20WarpRouteReader(multiProvider, chain);
        const tokenType = await reader.deriveTokenType(warpRouteAddress);
        const warpRouteConfig = await reader.deriveWarpRouteConfig(warpRouteAddress);
        const tokenConfig = await reader.fetchTokenConfig(tokenType, warpRouteAddress);
        const mailboxConfig = await reader.fetchMailboxClientConfig(warpRouteAddress);

        return JSON.stringify({
            tokenType,
            warpRouteConfig,
            tokenConfig,
            mailboxConfig,
        });
    }

    /**
     * @method
     * @name HyperlaneService#sendAssets
     * @description Sends tokens across chains using an approved Hyperlane warp route
     * @param {EVMWalletClient} walletClient The wallet client to approve and send the transfer
     * @param {HyperlaneSendAssetsParameters} parameters Parameters for the cross-chain asset transfer
     * @param {string} parameters.warpRouteAddress Warp route contract address
     * @param {string} parameters.originChain Origin chain
     * @param {string} parameters.destinationChain Destination chain
     * @param {string} parameters.recipientAddress Destination address
     * @param {string} parameters.tokenAddress Origin chain token contract address
     * @param {string} parameters.amount Amount to transfer (in human-readable units)
     * @returns {Object} An object with success message and transaction hash
     * @throws {Error} If approval or transfer fails
     */
    @Tool({
        name: "hyperlane_send_assets",
        description: "Send assets cross-chain using a Hyperlane warp route",
    })
    async sendAssets(walletClient: EVMWalletClient, parameters: HyperlaneSendAssetsParameters): Promise<string> {
        const { originChain, tokenAddress, warpRouteAddress, destinationChain, recipientAddress, amount } = parameters;
        const { multiProvider } = await this.getMultiProvider(walletClient);
        const originReader = new EvmERC20WarpRouteReader(multiProvider, originChain);
        const readerWarpRouteConfig = await originReader.deriveWarpRouteConfig(warpRouteAddress);
        //
        //    {
        //        mailbox: "0xfFAEF09B3cd11D9b20d1a19bECca54EEC2884766",
        //        owner: "0x9a2D8681FfCc45b0c18E72b16FBA9b2270B911eD",
        //        hook: "0x0000000000000000000000000000000000000000",
        //        interchainSecurityModule: {
        //            address: "0x1d80B4eA89Ea345a1A8eE25acf623084A77101EC",
        //            type: "staticAggregationIsm",
        //            modules: [
        //                {
        //                    owner: "0x9a2D8681FfCc45b0c18E72b16FBA9b2270B911eD",
        //                    address: "0x27de9B2fd78DB2d44A457a4D5b798dd492e4D0cb",
        //                    type: "defaultFallbackRoutingIsm",
        //                    domains: {},
        //                },
        //                {
        //                    address: "0x67dd445BB22174F57d5706B60C80B8d16b21a0E0",
        //                    relayer: "0x9a2D8681FfCc45b0c18E72b16FBA9b2270B911eD",
        //                    type: "trustedRelayerIsm",
        //                },
        //            ],
        //            threshold: 1,
        //        },
        //        type: "native",
        //        name: "Ether",
        //        symbol: "ETH",
        //        decimals: 18,
        //        remoteRouters: {
        //            "44787": {
        //                address: "0x78fe869f19f917fde4192c51c446Fbd3721788ee",
        //            },
        //        },
        //        proxyAdmin: {
        //            address: "0x387A32a5CE85114C10DFE684a9F67cB6e00d6153",
        //            owner: "0x9a2D8681FfCc45b0c18E72b16FBA9b2270B911eD",
        //        },
        //        destinationGas: {
        //            "44787": "64000",
        //        },
        //    }
        //
        const originTokenType = readerWarpRouteConfig.type;
        const weiAmount = await this.toWeiAmount({
            amount: String(amount),
            tokenType: originTokenType,
            tokenAddress,
            walletClient,
        });

        const destinationDomainId = (await this.getDomainId(destinationChain)) as number;
        const recipientAddressBytes32 = utils.hexZeroPad(recipientAddress, 32);

        let transferTx: EVMTransactionResult;
        if (originTokenType === TokenType.native) {
            const recipientContractAddress = readerWarpRouteConfig.remoteRouters
                ? readerWarpRouteConfig.remoteRouters[destinationDomainId].address
                : undefined; // TODO: What if it's undefined
            const recipientContractAddressBytes32 = utils.hexZeroPad(recipientContractAddress as string, 32); // ? possibly undefined

            const protocolFee = await this.getQuoteDispatchFee({
                mailboxAddress: readerWarpRouteConfig.mailbox,
                warpRouteAddress,
                destinationChain,
                amount: weiAmount,
                recipientAddressBytes32,
                recipientContractAddressBytes32,
                walletClient,
            });

            transferTx = await walletClient.sendTransaction({
                to: warpRouteAddress,
                functionName: "transferRemote",
                args: [destinationDomainId, recipientAddressBytes32, weiAmount],
                abi: transferRemoteNativeAbi,
                value: weiAmount + protocolFee,
            });
        } else {
            await this.approveTransfer(walletClient, { tokenAddress, warpRouteAddress, amount: weiAmount });
            transferTx = await walletClient.sendTransaction({
                to: warpRouteAddress,
                functionName: "transferRemote",
                args: [destinationDomainId, recipientAddressBytes32, weiAmount],
                abi: transferRemoteCollateralAbi,
            });
        }

        return stringifyWithBigInts({
            message: "Cross-chain asset transfer initiated",
            transaction: transferTx,
        });
    }

    private async approveTransfer(
        walletClient: EVMWalletClient,
        parameters: {
            tokenAddress: string;
            warpRouteAddress: string;
            amount: bigint;
        },
    ) {
        const { tokenAddress, warpRouteAddress, amount } = parameters;
        const approveTx = await walletClient.sendTransaction({
            to: tokenAddress,
            functionName: "approve",
            args: [warpRouteAddress, amount],
            abi: hyperlaneABI,
        });
        console.log(`transaction approved: ${approveTx.hash}`);
    }

    /**
     * @method
     * @name HyperlaneService#getWarpRoutesForChain
     * @description Returns all warp routes on a given chain from the Hyperlane registry
     * @param {EVMWalletClient} walletClient The wallet client used to access the registry
     * @param {HyperlaneGetWarpRoutesForChainParameters} parameters Parameters to filter routes by chain
     * @param {string} parameters.chain Chain name (e.g. "base", "arbitrum")
     * @returns {WarpRoutes} A mapping of warp route addresses to their configuration
     * @throws {Error} If warp route retrieval fails
     */
    async getWarpRoutesForChain(
        walletClient: EVMWalletClient,
        parameters: HyperlaneGetWarpRoutesForChainParameters,
    ): Promise<WarpRoutes> {
        const { chain } = parameters;
        const { multiProvider, registry } = await this.getMultiProvider(walletClient);

        const allWarpRoutes = await this.getWarpRoutes(registry);
        //
        //    {
        //        tokens: [
        //            {
        //                addressOrDenom: "0x9a3BeED38441e8fF8E033043a88B49E035F5a2da",
        //                chainName: "ethereum",
        //                coinGeckoId: "ethereum",
        //                connections: [
        //                    {
        //                        token: "ethereum|hyperevm|0x1fbcCdc677c10671eE50b46C61F0f7d135112450",
        //                    },
        //                ],
        //                decimals: 18,
        //                logoURI: "/deployments/warp_routes/ETH/logo.svg",
        //                name: "Ether",
        //                standard: "EvmHypNative",
        //                symbol: "ETH",
        //            },
        //            ...
        //        ],
        //    }
        //
        const routes: WarpRoutes = {};

        for (const [warpRoute, data] of Object.entries(allWarpRoutes)) {
            if (data.tokens.some((token) => token.chainName.toLowerCase() === chain.toLowerCase())) {
                routes[warpRoute] = data;
            }
        }
        return routes;
    }

    /**
     * @ignore
     * @method
     * @name HyperlaneService#convertAmount
     * @description Converts a currency amount to a wei amount
     * @param {string} tokenAddress The on-chain address of the ERC-20 token contract, must implement the standard `decimals()` view method
     * @param {string} amount The human-readable token amount (e.g., "1.5"). Must be a valid string representation of a numeric value
     * @param {EVMWalletClient} walletClient users wallet
     * @returns {Promise<ethers.BigNumber>} The amount in wei
     */
    private async toWeiAmount(parameters: {
        amount: string;
        tokenType: TokenType;
        tokenAddress: string;
        walletClient: EVMWalletClient;
    }): Promise<bigint> {
        const { amount, tokenType, tokenAddress, walletClient } = parameters;

        const isNative = tokenType === TokenType.native;

        const decimals = isNative
            ? 18
            : Number(
                  (
                      await walletClient.read({
                          address: tokenAddress,
                          abi: hyperlaneABI,
                          functionName: "decimals",
                          args: [],
                      })
                  ).value,
              );

        return ethers.utils.parseUnits(amount, decimals).toBigInt();
    }

    private async getDomainId(chain: string): Promise<number | undefined> {
        const { multiProvider } = await this.getMultiProvider();
        const chainConfig = multiProvider.getChainMetadata(chain);
        return chainConfig?.domainId;
    }

    private async getQuoteDispatchFee(parameters: {
        mailboxAddress: string;
        destinationChain: string;
        warpRouteAddress: string;
        amount: bigint; // amount in wei
        recipientAddressBytes32: string;
        recipientContractAddressBytes32: string;
        walletClient: EVMWalletClient;
    }): Promise<bigint> {
        const {
            mailboxAddress,
            destinationChain,
            walletClient,
            recipientContractAddressBytes32,
            amount,
            recipientAddressBytes32,
        } = parameters;

        const destinationDomain = (await this.getDomainId(destinationChain)) as number;

        const messageBody = encodePacked(
            ["bytes32", "uint256", "bytes"],
            [recipientAddressBytes32 as `0x${string}`, amount, "0x"],
        );

        const { value } = await walletClient.read({
            address: mailboxAddress,
            abi: hyperlaneABI,
            functionName: "quoteDispatch",
            args: [destinationDomain, recipientContractAddressBytes32, messageBody],
        });

        return BigNumber.from(value).toBigInt();
    }
}

function createWarpRoutesSingleton() {
    let lastRegistry: GithubRegistry | null = null;
    let warpRoutes: WarpRoutes | null = null;

    return async function getWarpRoutes(registry: GithubRegistry): Promise<WarpRoutes> {
        if (registry !== lastRegistry) {
            warpRoutes = await registry.getWarpRoutes();
            lastRegistry = registry;
        }
        return warpRoutes as WarpRoutes;
    };
}

function createMultiProviderSingleton() {
    let instance: { multiProvider: MultiProvider; registry: GithubRegistry } | null = null;
    let lastRefresh: number | null = null;
    const oneDay = 86400000; // milliseconds in one day
    const REGISTRY_URL: string = "https://github.com/hyperlane-xyz/hyperlane-registry";
    const REGISTRY_PROXY_URL: string = "https://proxy.hyperlane.xyz";

    return async (walletClient?: EVMWalletClient) => {
        const now = Date.now();
        const refresh = lastRefresh && now - lastRefresh > oneDay; // refresh daily

        if (!instance || refresh || globalRefresh) {
            // TODO: make a forceRefresh variable instead of globalRefresh
            const registry = new GithubRegistry({
                uri: REGISTRY_URL,
                proxyUrl: REGISTRY_PROXY_URL,
            });
            const chainMetadata = await registry.getMetadata(); // * Gives "Error: Failed to fetch from github: 429 Too Many Requests" sometimes
            //
            //    {
            //        'ethereum': {
            //            blockExplorers: [
            //                {
            //                    apiKey: "CYUPN3Q66JIMRGQWYUDXJKQH4SX8YIYZMW",
            //                    apiUrl: "https://api.etherscan.io/api",
            //                    family: "etherscan",
            //                    name: "Etherscan",
            //                    url: "https://etherscan.io",
            //                },
            //                ...
            //            ],
            //            blocks: {
            //                confirmations: 2,
            //                estimateBlockTime: 13,
            //                reorgPeriod: 15,
            //            },
            //            chainId: 1,
            //            deployer: {
            //                name: "Abacus Works",
            //                url: "https://www.hyperlane.xyz",
            //            },
            //            displayName: "Ethereum",
            //            domainId: 1,
            //            gasCurrencyCoinGeckoId: "ethereum",
            //            gnosisSafeTransactionServiceUrl: "https://safe-transaction-mainnet.safe.global/",
            //            name: "ethereum",
            //            nativeToken: {
            //                decimals: 18,
            //                name: "Ether",
            //                symbol: "ETH",
            //            },
            //            protocol: "ethereum",
            //            rpcUrls: [
            //                {
            //                    http: "https://eth.llamarpc.com",
            //                },
            //                ...
            //            ],
            //            technicalStack: "other",
            //        }
            //        ...
            //    }
            //
            const multiProvider = new MultiProvider<ChainMetadata>(chainMetadata);

            if (walletClient) {
                const signer = new EVMWalletClientSigner(walletClient);
                // const signer = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY as string);
                multiProvider.setSharedSigner(signer);
            }

            instance = { multiProvider, registry };
            lastRefresh = now;
            globalRefresh = false;
        }

        return instance;
    };
}
