import { Tool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { GithubRegistry } from "@hyperlane-xyz/registry";
import {
    ChainMetadata,
    CoreConfig,
    HookType,
    HypERC20Deployer,
    HyperlaneContractsMap,
    HyperlaneCore,
    HyperlaneCoreDeployer,
    HyperlaneIsmFactory,
    IsmType,
    MultiProvider,
    TOKEN_TYPE_TO_STANDARD,
    TokenFactories,
    TokenType,
    WarpCoreConfig,
    WarpRouteDeployConfig,
    WarpRouteDeployConfigSchema,
    getTokenConnectionId,
    isCollateralTokenConfig,
    isTokenMetadata,
} from "@hyperlane-xyz/sdk";
import { EvmIsmReader } from "@hyperlane-xyz/sdk";
import { ProtocolType } from "@hyperlane-xyz/utils";
import { assert } from "@hyperlane-xyz/utils";
import { ethers } from "ethers";
import {
    HyperlaneAnnounceValidatorParameters,
    HyperlaneDeployChainParameters,
    HyperlaneDeployParameters,
    HyperlaneGasPaymentParameters,
    HyperlaneGetDeployedContractsParameters,
    HyperlaneGetMailboxParameters,
    HyperlaneGetTokenParameters,
    HyperlaneIsmParameters,
    HyperlaneReadMessageParameters,
    HyperlaneRelayerConfigParameters,
    HyperlaneRelayerMonitorParameters,
    HyperlaneSecurityMonitorParameters,
    HyperlaneSendMessageParameters,
    HyperlaneValidatorParameters,
} from "./parameters";

import * as dotenv from "dotenv";
dotenv.config();

const REGISTRY_URL = "https://github.com/hyperlane-xyz/hyperlane-registry";
const REGISTRY_PROXY_URL = "https://proxy.hyperlane.xyz";

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

export class HyperlaneService {
    @Tool({
        name: "make_hyperlane_warp",
        description: "Deploy a Hyperlane Warp bridge between two chains",
    })
    async deployBridge(walletClient: EVMWalletClient, parameters: HyperlaneDeployParameters) {
        assert(process.env.WALLET_PRIVATE_KEY, "Missing Private Key");

        const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY);
        const { multiProvider, registry } = await getMultiProvider(wallet);

        const { origin, destination, token } = parameters;
        const owner = walletClient.getAddress();

        // Get chain addresses and validate
        const chainAddresses = await registry.getAddresses();
        console.log("Available chains:", Object.keys(chainAddresses));

        if (!chainAddresses[origin]?.mailbox) {
            throw new Error(
                `No mailbox found for origin chain: ${origin}. Available chains: ${Object.keys(chainAddresses).join(", ")}`,
            );
        }
        if (!chainAddresses[destination]?.mailbox) {
            throw new Error(
                `No mailbox found for destination chain: ${destination}. Available chains: ${Object.keys(chainAddresses).join(", ")}`,
            );
        }

        const warpDeployConfig: WarpRouteDeployConfig = {
            [origin]: {
                type: TokenType.collateral,
                token,
                owner,
                mailbox: chainAddresses[origin].mailbox,
            },
            [destination]: {
                type: TokenType.synthetic,
                owner,
                mailbox: chainAddresses[destination].mailbox,
            },
        };

        console.log("Deploy config:", JSON.stringify(warpDeployConfig, null, 2));
        WarpRouteDeployConfigSchema.parse(warpDeployConfig);

        const deployedContracts = await new HypERC20Deployer(multiProvider).deploy(warpDeployConfig);
        const warpCoreConfig = await getWarpCoreConfig(multiProvider, warpDeployConfig, deployedContracts);

        return JSON.stringify(
            {
                message: "Warp bridge deployed successfully",
                contracts: {
                    origin: warpCoreConfig.tokens.find((t) => t.chainName === origin),
                    destination: warpCoreConfig.tokens.find((t) => t.chainName === destination),
                },
                config: warpCoreConfig,
            },
            null,
            2,
        );
    }

    @Tool({
        name: "hyperlane_send_message",
        description: "Send a message from one chain to another using Hyperlane",
    })
    async sendMessage(walletClient: EVMWalletClient, parameters: HyperlaneSendMessageParameters) {
        assert(process.env.WALLET_PRIVATE_KEY, "Missing Private Key");

        const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY);
        const { multiProvider, registry } = await getMultiProvider(wallet);

        const { originChain, destinationChain, destinationAddress, message } = parameters;
        const chainAddresses = await registry.getAddresses();

        try {
            // Create HyperlaneCore instance
            const hyperlane = HyperlaneCore.fromAddressesMap(chainAddresses, multiProvider);

            // Send the message using the SDK
            const { dispatchTx, message: dispatchedMessage } = await hyperlane.sendMessage(
                originChain,
                destinationChain,
                destinationAddress,
                message,
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
        } catch (error) {
            console.error("Error details:", error);
            return JSON.stringify(
                {
                    message: "Failed to send message",
                    error: error instanceof Error ? error.message : String(error),
                    originChain,
                    destinationChain,
                },
                null,
                2,
            );
        }
    }

    @Tool({
        name: "hyperlane_read_message",
        description: "Check the status and content of a Hyperlane message using chain name and message ID",
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
        } catch (err: unknown) {
            const error = err as Error;
            if (error.message?.includes("No dispatch event found")) {
                return JSON.stringify(
                    {
                        message: "Message not found",
                        details: {
                            chain,
                            messageId,
                            reason: "Message may be too recent or not exist on this chain",
                        },
                    },
                    null,
                    2,
                );
            }

            return JSON.stringify(
                {
                    message: "Failed to read message",
                    error: error.message || String(error),
                    details: {
                        chain,
                        messageId,
                    },
                },
                null,
                2,
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
        } catch (error) {
            return JSON.stringify(
                {
                    message: "Failed to retrieve mailbox address",
                    error: error instanceof Error ? error.message : String(error),
                },
                null,
                2,
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
        } catch (error) {
            return JSON.stringify(
                {
                    message: "Failed to retrieve deployed contracts",
                    error: error instanceof Error ? error.message : String(error),
                    chain,
                    contractType,
                },
                null,
                2,
            );
        }
    }

    @Tool({
        name: "hyperlane_configure_ism",
        description: "Configure Interchain Security Module settings",
    })
    async configureIsm(walletClient: EVMWalletClient, parameters: HyperlaneIsmParameters) {
        assert(process.env.WALLET_PRIVATE_KEY, "Missing Private Key");

        const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY);
        const { multiProvider, registry } = await getMultiProvider(wallet);

        try {
            const { chain, type, config } = parameters;
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
            });

            return JSON.stringify(
                {
                    message: "ISM configured successfully",
                    details: {
                        chain,
                        type,
                        address: deployedIsm.address,
                        config: ismConfig,
                    },
                },
                null,
                2,
            );
        } catch (error) {
            return JSON.stringify(
                {
                    message: "Failed to configure ISM",
                    error: error instanceof Error ? error.message : String(error),
                    parameters,
                },
                null,
                2,
            );
        }
    }

    @Tool({
        name: "hyperlane_manage_validators",
        description: "Manage validator set for multisig ISM",
    })
    async manageValidators(walletClient: EVMWalletClient, parameters: HyperlaneValidatorParameters) {
        assert(process.env.WALLET_PRIVATE_KEY, "Missing Private Key");

        const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY);
        const { multiProvider, registry } = await getMultiProvider(wallet);

        try {
            const { chain, action, validator, weight } = parameters;
            const chainAddresses = await registry.getAddresses();

            // Set the signer for this chain
            multiProvider.setSharedSigner(wallet);
            const signer = multiProvider.getSigner(chain);

            // Get ISM reader
            const ismReader = new EvmIsmReader(multiProvider, chain);
            const validatorConfig = await ismReader.deriveMultisigConfig(validator);

            // Create transaction based on action
            // biome-ignore lint/suspicious/noExplicitAny: na
            let tx: any;
            const multisigContract = new ethers.Contract(
                validator,
                [
                    "function addValidator(address validator, uint256 weight) external",
                    "function removeValidator(address validator) external",
                    "function updateValidatorWeight(address validator, uint256 weight) external",
                ],
                signer,
            );

            switch (action) {
                case "ADD":
                    tx = await multisigContract.addValidator(validator, weight || 1);
                    break;
                case "REMOVE":
                    tx = await multisigContract.removeValidator(validator);
                    break;
                case "UPDATE":
                    tx = await multisigContract.updateValidatorWeight(validator, weight || 1);
                    break;
            }

            const receipt = await tx.wait();

            return JSON.stringify(
                {
                    message: `Validator ${action.toLowerCase()}ed successfully`,
                    details: {
                        chain,
                        action,
                        validator,
                        weight,
                        transactionHash: receipt.transactionHash,
                    },
                },
                null,
                2,
            );
        } catch (error) {
            return JSON.stringify(
                {
                    message: "Failed to manage validator",
                    error: error instanceof Error ? error.message : String(error),
                    parameters,
                },
                null,
                2,
            );
        }
    }

    @Tool({
        name: "hyperlane_monitor_security",
        description: "Monitor ISM and validator status",
    })
    async monitorSecurity(parameters: HyperlaneSecurityMonitorParameters) {
        const { chain, messageId, validatorSet } = parameters;

        try {
            const { multiProvider, registry } = await getMultiProvider();
            const chainAddresses = await registry.getAddresses();

            // Create ISM reader
            const ismReader = new EvmIsmReader(multiProvider, chain);

            // biome-ignore lint/suspicious/noExplicitAny: na
            const result: any = {
                chain,
                status: "SECURE",
                details: {},
            };

            // If validatorSet is provided, check validator set status
            if (validatorSet) {
                const validatorConfig = await ismReader.deriveMultisigConfig(validatorSet);
                result.details.validatorSet = {
                    address: validatorSet,
                    validators: validatorConfig.validators,
                    threshold: validatorConfig.threshold,
                    totalValidators: validatorConfig.validators.length,
                };
            }

            // If messageId is provided, check message security
            if (messageId) {
                const hyperlane = HyperlaneCore.fromAddressesMap(chainAddresses, multiProvider);
                const dispatchTx = await hyperlane.getDispatchTx(chain, messageId);
                const messages = hyperlane.getDispatchedMessages(dispatchTx);
                const message = messages.find((m) => m.id === messageId);

                if (message) {
                    const isDelivered = await hyperlane.isDelivered(message);
                    const destination = message.parsed.destinationChain;
                    const mailboxAddress =
                        destination && chainAddresses[destination] ? chainAddresses[destination].mailbox : undefined;

                    result.details.message = {
                        id: messageId,
                        status: isDelivered ? "DELIVERED" : "PENDING",
                        security: {
                            destination,
                            mailboxAddress,
                            isVerified: isDelivered,
                        },
                    };
                }
            }

            return JSON.stringify(
                {
                    message: "Security status retrieved successfully",
                    details: result,
                },
                null,
                2,
            );
        } catch (error) {
            return JSON.stringify(
                {
                    message: "Failed to monitor security",
                    error: error instanceof Error ? error.message : String(error),
                    parameters,
                },
                null,
                2,
            );
        }
    }

    @Tool({
        name: "hyperlane_announce_validator",
        description: "Announce a validator's signing address for a chain",
    })
    async announceValidator(walletClient: EVMWalletClient, parameters: HyperlaneAnnounceValidatorParameters) {
        assert(process.env.WALLET_PRIVATE_KEY, "Missing Private Key");

        const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY);
        const { multiProvider, registry } = await getMultiProvider(wallet);

        try {
            const { chain, validatorAddress, signingAddress, mailboxAddress } = parameters;

            // Set up the validator announce contract interface
            const validatorAnnounceContract = new ethers.Contract(
                mailboxAddress,
                ["function announce(address validator, address signingAddress) external"],
                multiProvider.getSigner(chain),
            );

            // Announce the validator
            const tx = await validatorAnnounceContract.announce(validatorAddress, signingAddress);

            const receipt = await tx.wait();

            return JSON.stringify(
                {
                    message: "Validator announced successfully",
                    details: {
                        chain,
                        validatorAddress,
                        signingAddress,
                        mailboxAddress,
                        transactionHash: receipt.transactionHash,
                    },
                },
                null,
                2,
            );
        } catch (error) {
            return JSON.stringify(
                {
                    message: "Failed to announce validator",
                    error: error instanceof Error ? error.message : String(error),
                    parameters,
                },
                null,
                2,
            );
        }
    }

    @Tool({
        name: "hyperlane_configure_relayer",
        description: "Configure relayer settings for message delivery",
    })
    async configureRelayer(walletClient: EVMWalletClient, parameters: HyperlaneRelayerConfigParameters) {
        assert(process.env.WALLET_PRIVATE_KEY, "Missing Private Key");

        const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY);
        const { multiProvider, registry } = await getMultiProvider(wallet);

        try {
            const { chain, whitelist, blacklist, gasPaymentConfig } = parameters;
            const chainAddresses = await registry.getAddresses();

            // Get the relayer contract
            const relayerAddress = chainAddresses[chain]?.relayer;
            if (!relayerAddress) {
                throw new Error(`No relayer found for chain: ${chain}`);
            }

            const relayerContract = new ethers.Contract(
                relayerAddress,
                [
                    "function setWhitelist(address[] calldata addresses, bool[] calldata statuses) external",
                    "function setBlacklist(address[] calldata addresses, bool[] calldata statuses) external",
                    "function setGasPaymentConfiguration(uint256 minGas, uint256 maxGas, address gasToken) external",
                ],
                multiProvider.getSigner(chain),
            );

            const transactions = [];

            // Configure whitelist if provided
            if (whitelist && whitelist.length > 0) {
                const tx = await relayerContract.setWhitelist(
                    whitelist,
                    whitelist.map(() => true),
                );
                transactions.push(await tx.wait());
            }

            // Configure blacklist if provided
            if (blacklist && blacklist.length > 0) {
                const tx = await relayerContract.setBlacklist(
                    blacklist,
                    blacklist.map(() => true),
                );
                transactions.push(await tx.wait());
            }

            // Configure gas payment if provided
            if (gasPaymentConfig) {
                const tx = await relayerContract.setGasPaymentConfiguration(
                    gasPaymentConfig.minGas,
                    gasPaymentConfig.maxGas,
                    gasPaymentConfig.gasToken,
                );
                transactions.push(await tx.wait());
            }

            return JSON.stringify(
                {
                    message: "Relayer configured successfully",
                    details: {
                        chain,
                        relayerAddress,
                        transactions: transactions.map((tx) => tx.transactionHash),
                        config: {
                            whitelist,
                            blacklist,
                            gasPaymentConfig,
                        },
                    },
                },
                null,
                2,
            );
        } catch (error) {
            return JSON.stringify(
                {
                    message: "Failed to configure relayer",
                    error: error instanceof Error ? error.message : String(error),
                    parameters,
                },
                null,
                2,
            );
        }
    }

    @Tool({
        name: "hyperlane_manage_gas_payment",
        description: "Manage interchain gas payments for relayers",
    })
    async manageGasPayment(walletClient: EVMWalletClient, parameters: HyperlaneGasPaymentParameters) {
        assert(process.env.WALLET_PRIVATE_KEY, "Missing Private Key");

        const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY);
        const { multiProvider, registry } = await getMultiProvider(wallet);

        try {
            const { chain, messageId, gasAmount, recipient } = parameters;
            const chainAddresses = await registry.getAddresses();

            // Get the IGP (InterchainGasPaymaster) contract
            const igpAddress = chainAddresses[chain]?.interchainGasPaymaster;
            if (!igpAddress) {
                throw new Error(`No IGP found for chain: ${chain}`);
            }

            const igpContract = new ethers.Contract(
                igpAddress,
                ["function payForGas(bytes32 messageId, uint256 gasAmount, address recipient) external payable"],
                multiProvider.getSigner(chain),
            );

            // Pay for gas
            const tx = await igpContract.payForGas(messageId, gasAmount, recipient, { value: gasAmount });

            const receipt = await tx.wait();

            return JSON.stringify(
                {
                    message: "Gas payment successful",
                    details: {
                        chain,
                        messageId,
                        gasAmount: gasAmount.toString(),
                        recipient,
                        igpAddress,
                        transactionHash: receipt.transactionHash,
                    },
                },
                null,
                2,
            );
        } catch (error) {
            return JSON.stringify(
                {
                    message: "Failed to process gas payment",
                    error: error instanceof Error ? error.message : String(error),
                    parameters,
                },
                null,
                2,
            );
        }
    }

    @Tool({
        name: "hyperlane_monitor_relayer",
        description: "Monitor relayer status and performance",
    })
    async monitorRelayer(parameters: HyperlaneRelayerMonitorParameters) {
        try {
            const { chain, relayer, metrics } = parameters;
            const { multiProvider, registry } = await getMultiProvider();
            const chainAddresses = await registry.getAddresses();

            // Get the relayer contract
            const relayerAddress = relayer || chainAddresses[chain]?.relayer;
            if (!relayerAddress) {
                throw new Error(`No relayer found for chain: ${chain}`);
            }

            const relayerContract = new ethers.Contract(
                relayerAddress,
                [
                    "function getDeliveredMessages() external view returns (uint256)",
                    "function getGasUsed() external view returns (uint256)",
                    "function getAverageLatency() external view returns (uint256)",
                    "function getSuccessRate() external view returns (uint256)",
                ],
                multiProvider.getProvider(chain),
            );

            // biome-ignore lint/suspicious/noExplicitAny: na
            const result: any = {
                chain,
                relayer: relayerAddress,
                metrics: {},
            };

            // Collect requested metrics
            for (const metric of metrics) {
                switch (metric) {
                    case "messages_delivered":
                        result.metrics.messagesDelivered = await relayerContract.getDeliveredMessages();
                        break;
                    case "gas_used":
                        result.metrics.gasUsed = await relayerContract.getGasUsed();
                        break;
                    case "latency":
                        result.metrics.averageLatency = await relayerContract.getAverageLatency();
                        break;
                    case "success_rate":
                        result.metrics.successRate = await relayerContract.getSuccessRate();
                        break;
                }
            }

            return JSON.stringify(
                {
                    message: "Relayer metrics retrieved successfully",
                    details: result,
                },
                null,
                2,
            );
        } catch (error) {
            return JSON.stringify(
                {
                    message: "Failed to monitor relayer",
                    error: error instanceof Error ? error.message : String(error),
                    parameters,
                },
                null,
                2,
            );
        }
    }

    @Tool({
        name: "hyperlane_deploy_chain",
        description: "Deploy Hyperlane core contracts to a new chain",
    })
    async deployChain(walletClient: EVMWalletClient, parameters: HyperlaneDeployChainParameters) {
        assert(process.env.WALLET_PRIVATE_KEY, "Missing Private Key");

        const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY);
        const { multiProvider, registry } = await getMultiProvider(wallet);

        try {
            const { chain, chainId, domainId, rpcUrl, contracts, validators } = parameters;

            // Add new chain metadata
            const chainMetadata: ChainMetadata = {
                name: chain,
                chainId,
                domainId: domainId || chainId,
                protocol: "ethereum" as ProtocolType,
                rpcUrls: [{ http: rpcUrl }],
                nativeToken: { name: "Native Token", symbol: "ETH", decimals: 18 },
            };

            // Create new MultiProvider with the new chain
            const newMultiProvider = new MultiProvider({
                ...multiProvider.metadata,
                [chain]: chainMetadata,
            });
            newMultiProvider.setSharedSigner(wallet);

            // Create core config
            const coreConfig: CoreConfig = {
                owner: walletClient.getAddress(),
                defaultIsm: validators
                    ? {
                          type: IsmType.MESSAGE_ID_MULTISIG,
                          validators: validators.map((v) => v.address),
                          threshold: Math.floor(validators.reduce((sum, v) => sum + (v.weight || 1), 0) / 2) + 1,
                      }
                    : { type: IsmType.TEST_ISM },
                defaultHook: { type: HookType.MERKLE_TREE },
                requiredHook: { type: HookType.MERKLE_TREE },
                ownerOverrides: {},
            };

            // Create ISM factory and core deployer
            const ismFactory = new HyperlaneIsmFactory({}, newMultiProvider);
            const coreDeployer = new HyperlaneCoreDeployer(
                newMultiProvider,
                ismFactory,
                undefined, // contractVerifier
                true, // concurrentDeploy
            );

            // Deploy core contracts
            const deployedContracts = await coreDeployer.deployContracts(chain, coreConfig);

            return JSON.stringify(
                {
                    message: "Hyperlane core contracts deployed successfully",
                    details: {
                        chain,
                        chainId,
                        domainId: chainMetadata.domainId,
                        contracts: {
                            mailbox: deployedContracts.mailbox.address,
                            validatorAnnounce: deployedContracts.validatorAnnounce.address,
                            proxyAdmin: deployedContracts.proxyAdmin.address,
                        },
                        validators: validators?.map((v) => ({
                            address: v.address,
                            weight: v.weight || 1,
                        })),
                    },
                },
                null,
                2,
            );
        } catch (error) {
            return JSON.stringify(
                {
                    message: "Failed to deploy Hyperlane core contracts",
                    error: error instanceof Error ? error.message : String(error),
                    parameters,
                },
                null,
                2,
            );
        }
    }

    @Tool({
        name: "get_hyperlane_tokens",
        description: "Get deployed tokens on Hyperlane Warp Routes from the registry",
    })
    async getTokens(parameters: HyperlaneGetTokenParameters) {
        try {
            const { chain, tokenSymbol, standard, routerAddress } = parameters;
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
                    if (chain && token.chainName !== chain) continue;
                    if (tokenSymbol && token.symbol !== tokenSymbol) continue;
                    if (standard && token.standard !== standard) continue;
                    if (routerAddress && token.addressOrDenom !== routerAddress) continue;

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
                        routerAddress: token.addressOrDenom,
                        tokenAddress: token.collateralAddressOrDenom || null,
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
                            routerAddress,
                        },
                        tokens,
                    },
                },
                null,
                2,
            );
        } catch (error) {
            return JSON.stringify(
                {
                    message: "Failed to get tokens",
                    error: error instanceof Error ? error.message : String(error),
                    parameters,
                },
                null,
                2,
            );
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

async function getMultiProvider(signer?: ethers.Signer) {
    const registry = new GithubRegistry({
        uri: REGISTRY_URL,
        proxyUrl: REGISTRY_PROXY_URL,
    });

    const chainMetadata = await registry.getMetadata();
    const multiProvider = new MultiProvider(chainMetadata);
    if (signer) multiProvider.setSharedSigner(signer);
    return { multiProvider, registry };
}

async function getWarpCoreConfig(
    multiProvider: MultiProvider,
    warpDeployConfig: WarpRouteDeployConfig,
    contracts: HyperlaneContractsMap<TokenFactories>,
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
    contracts: HyperlaneContractsMap<TokenFactories>,
    symbol: string,
    name: string,
    decimals: number,
): void {
    for (const [chainName, contract] of Object.entries(contracts)) {
        const config = warpDeployConfig[chainName];
        const collateralAddressOrDenom = isCollateralTokenConfig(config) ? config.token : undefined;

        const tokenType = config.type as keyof TokenFactories;
        const tokenContract = contract[tokenType];

        assert(tokenContract?.address, "Missing token contract address");

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
