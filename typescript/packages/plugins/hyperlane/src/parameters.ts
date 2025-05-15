import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

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
        chain: z.string().describe("Origin chain name where message was sent from"),
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
        mailbox: z.string().optional().describe("(Optional) Mailbox address"),
        origin: z.string().optional().describe("(Optional) Origin chain"),
        existingIsmAddress: z.string().optional().describe("(Optional) Existing ISM address"),
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

export class HyperlaneGetTokenParameters extends createToolParameters(
    z.object({
        chain: z.string().describe("Chain name (e.g. base, arbitrum)"),
        tokenSymbol: z.string().optional().describe("Token symbol to search for (e.g. USDC)"),
        standard: z
            .enum([
                // ? Should this be an enum? I feel like more values could be added in the future
                "EvmHypCollateral",
                "EvmHypSynthetic",
                "EvmHypNative",
                "SealevelHypSynthetic",
                "EvmHypNative",
                "SealevelHypCollateral",
                "EvmHypCollateralFiat",
                "CwHypCollateral",
                "CosmosIbc",
                "EvmHypXERC20",
                "EvmHypXERC20Lockbox",
                "CwHypNative",
                "CosmosNativeHypCollateral",
                "SealevelHypNative",
                "EvmNative",
                "EvmHypOwnerCollateral",
                "EvmHypVSXERC20",
                "EvmHypVSXERC20Lockbox",
                "EvmHypSyntheticRebase",
                "EvmHypRebaseCollateral",
            ])
            .optional()
            .describe("Token standard (EvmHypCollateral, EvmHypSynthetic, etc.)"),
        tokenRouterAddress: z.string().optional().describe("Specific router address to get token for"),
    }),
) {}

export class HyperlaneInspectWarpRouteParameters extends createToolParameters(
    z.object({
        warpRouteAddress: z.string().describe("The warp route address to inspect"),
        chain: z.string().describe("The chain name (e.g. base, arbitrum)"),
    }),
) {}

export class HyperlaneSendAssetsParameters extends createToolParameters(
    z.object({
        tokenAddress: z
            .string()
            .regex(/^0x[a-fA-F0-9]{40}$/)
            .describe("Token contract address"),
        warpRouteAddress: z.string().describe("Warp route address"),
        originChain: z.string().describe("Origin chain name (e.g. base, arbitrum)"),
        destinationChain: z.string().describe("Destination chain name (e.g. base, arbitrum)"),
        recipientAddress: z.string().describe("Recipient address"),
        amount: z.string().describe("Amount to send"),
    }),
) {}

export class HyperlaneGetWarpRoutesForChainParameters extends createToolParameters(
    z.object({
        chain: z.string().describe("Chain name (e.g. base, arbitrum)"),
    }),
) {}
