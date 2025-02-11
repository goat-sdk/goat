import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

export class HyperlaneDeployParameters extends createToolParameters(
    z.object({
        origin: z.string().min(1).describe("Origin chain name (e.g. baseSepolia, arbitrumSepolia)"),
        destination: z.string().min(1).describe("Destination chain name (e.g. baseSepolia, arbitrumSepolia)"),
        token: z
            .string()
            .regex(/^0x[a-fA-F0-9]{40}$/)
            .describe("Token contract address on the origin chain"),
    }),
) {}

export class HyperlaneSendMessageParameters extends createToolParameters(
    z.object({
        originChain: z.string().describe("From chain name (e.g. base, arbitrum)"),
        destinationChain: z.string().describe("To chain name (e.g. base, arbitrum)"),
        destinationAddress: z.string().describe("Recipient address"),
        message: z.string().describe("Message content"),
    }),
) {}

export class HyperlaneReadMessageParameters extends createToolParameters(
    z.object({
        chain: z.string().describe("Chain name where message was sent"),
        messageId: z.string().describe("Message ID to check"),
    }),
) {}

export class HyperlaneGetMailboxParameters extends createToolParameters(
    z.object({
        chain: z.string().describe("Chain name (e.g. base, arbitrum)"),
    }),
) {}

export class HyperlaneGetDeployedContractsParameters extends createToolParameters(
    z.object({
        chain: z.string().describe("Chain name to get deployed contracts for (e.g. base, arbitrum)"),
        contractType: z.string().optional().describe("Specific contract type to filter (e.g. mailbox, ism, hook)"),
    }),
) {}

export class HyperlaneIsmParameters extends createToolParameters(
    z.object({
        chain: z.string().describe("Chain name (e.g. base, arbitrum)"),
        type: z
            .enum([
                "merkleRootMultisigIsm",
                "messageIdMultisigIsm",
                "storageMerkleRootMultisigIsm",
                "storageMessageIdMultisigIsm",
                "weightedMerkleRootMultisigIsm",
                "weightedMessageIdMultisigIsm",
                "pausableIsm",
                "trustedRelayerIsm",
                "testIsm",
                "opStackIsm",
                "arbL2ToL1Ism",
            ])
            .describe("Type of ISM to configure"),
        config: z
            .object({
                validators: z
                    .array(
                        z.object({
                            signingAddress: z.string(),
                            weight: z.number().optional(),
                        }),
                    )
                    .optional(),
                threshold: z.number().optional(),
                thresholdWeight: z.number().optional(),
                owner: z.string().optional(),
                paused: z.boolean().optional(),
                ownerOverrides: z.record(z.string()).optional(),
                relayer: z.string().optional(),
                origin: z.string().optional(),
                nativeBridge: z.string().optional(),
                bridge: z.string().optional(),
            })
            .describe("ISM configuration options"),
    }),
) {}

export class HyperlaneValidatorParameters extends createToolParameters(
    z.object({
        chain: z.string().describe("Chain name (e.g. base, arbitrum)"),
        action: z.enum(["ADD", "REMOVE", "UPDATE"]).describe("Action to perform on validator"),
        validator: z.string().describe("Validator address"),
        weight: z.number().optional().describe("Validator weight for weighted multisig"),
    }),
) {}

export class HyperlaneSecurityMonitorParameters extends createToolParameters(
    z.object({
        chain: z.string().describe("Chain name (e.g. base, arbitrum)"),
        messageId: z.string().optional().describe("Specific message ID to monitor"),
        validatorSet: z.string().optional().describe("Validator set address to monitor"),
    }),
) {}

export class HyperlaneAnnounceValidatorParameters extends createToolParameters(
    z.object({
        chain: z.string().describe("Chain name (e.g. base, arbitrum)"),
        validatorAddress: z.string().describe("Validator's address to announce"),
        signingAddress: z.string().describe("Validator's signing address"),
        mailboxAddress: z.string().describe("Mailbox contract address"),
    }),
) {}

export class HyperlaneRelayerConfigParameters extends createToolParameters(
    z.object({
        chain: z.string().describe("Chain name (e.g. base, arbitrum)"),
        whitelist: z.array(z.string()).optional().describe("Whitelisted addresses for message processing"),
        blacklist: z.array(z.string()).optional().describe("Blacklisted addresses for message processing"),
        gasPaymentConfig: z
            .object({
                minGas: z.number().describe("Minimum gas required for message processing"),
                maxGas: z.number().describe("Maximum gas allowed for message processing"),
                gasToken: z.string().describe("Gas token address for payments"),
            })
            .optional()
            .describe("Gas payment configuration"),
    }),
) {}

export class HyperlaneRelayerMonitorParameters extends createToolParameters(
    z.object({
        chain: z.string().describe("Chain name (e.g. base, arbitrum)"),
        relayer: z.string().describe("Relayer address to monitor"),
        metrics: z
            .array(z.enum(["messages_delivered", "gas_used", "latency", "success_rate"]))
            .describe("Metrics to monitor (messages_delivered, gas_used, latency, success_rate)"),
    }),
) {}

export class HyperlaneGasPaymentParameters extends createToolParameters(
    z.object({
        chain: z.string().describe("Chain name (e.g. base, arbitrum)"),
        messageId: z.string().describe("Message ID to pay gas for"),
        gasAmount: z.number().describe("Amount of gas to pay"),
        recipient: z.string().describe("Relayer address to receive payment"),
    }),
) {}

export class HyperlaneDeployChainParameters extends createToolParameters(
    z.object({
        chain: z.string().describe("Chain name (e.g. bitlayer)"),
        chainId: z.number().describe("Chain ID (e.g. 42069)"),
        domainId: z.number().describe("Hyperlane domain ID (usually same as chainId)"),
        rpcUrl: z.string().describe("RPC endpoint URL"),
        contracts: z
            .object({
                mailbox: z.string().optional().describe("Optional existing mailbox address"),
                validatorAnnounce: z.string().optional().describe("Optional existing validator announce address"),
                interchainGasPaymaster: z.string().optional().describe("Optional existing IGP address"),
                proxyAdmin: z.string().optional().describe("Optional existing proxy admin address"),
                defaultIsm: z.string().optional().describe("Optional default ISM address"),
            })
            .optional(),
        validators: z
            .array(
                z.object({
                    address: z.string().describe("Validator address"),
                    weight: z.number().optional().describe("Optional validator weight"),
                }),
            )
            .optional()
            .describe("Initial validator set"),
    }),
) {}

export class HyperlaneGetTokenParameters extends createToolParameters(
    z.object({
        chain: z.string().describe("Chain name (e.g. base, arbitrum)"),
        tokenSymbol: z.string().optional().describe("Token symbol to search for (e.g. USDC)"),
        standard: z
            .enum(["EvmHypCollateral", "EvmHypSynthetic"])
            .optional()
            .describe("Token standard (EvmHypCollateral or EvmHypSynthetic)"),
        routerAddress: z.string().optional().describe("Specific router address to get token for"),
    }),
) {}
