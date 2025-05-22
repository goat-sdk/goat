import { createToolParameters } from "@goat-sdk/core";
import { TokenType } from "@hyperlane-xyz/sdk";
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

export class HyperlaneDeployWarpRouteParameters extends createToolParameters(
    z.object({
        origin: z.object({
            chain: z.string().min(1).describe("The origin chain name (e.g. ethereum, baseSepolia)"),
            tokenAddress: z
                .string()
                .regex(/^0x[a-fA-F0-9]{40}$/)
                .describe("ERC20 token address on the origin chain"),
            type: z
                .enum(
                    Object.values(TokenType).filter((v): v is TokenType => typeof v === "string") as [
                        TokenType,
                        ...TokenType[],
                    ],
                )
                .describe("Token type, default='collateral'"),
            isNft: z.boolean().optional().describe("If using collateral for an ERC721 contract, set to true."),
            symbol: z.string().optional().describe("The token symbol"),
            name: z.string().optional().describe("The token name"),
            decimals: z.number().optional().describe("The number of decimal places for the token"),
            scale: z.number().optional().describe("The scale of the token"),
            mailbox: z
                .string()
                .optional()
                .describe("The address of the mailbox contract to use to send and receive messages"),
            interchainSecurityModule: z
                .string()
                .optional()
                .describe("The address of an interchain security modules to verify interchain messages"),
        }),
        destination: z.object({
            chain: z.string().describe("Destination chain names"),
            type: z
                .enum(
                    Object.values(TokenType).filter((v): v is TokenType => typeof v === "string") as [
                        TokenType,
                        ...TokenType[],
                    ],
                )
                .describe("Token type, default='synthentic'"),
            isNft: z.boolean().optional().describe("If using collateral for an ERC721 contract, set to true."),
            symbol: z.string().optional().describe("The token symbol"),
            name: z.string().optional().describe("The token name"),
            decimals: z.number().optional().describe("The number of decimal places for the token"),
            scale: z.number().optional().describe("The scale of the token"),
            mailbox: z
                .string()
                .optional()
                .describe("The address of the mailbox contract to use to send and receive messages"),
            interchainSecurityModule: z
                .string()
                .optional()
                .describe("The address of an interchain security modules to verify interchain messages"),
        }),

        // tokenType: z.enum(["synthetic", "collateral"]).describe("Type of warp token deployment (e.g. synthetic, collateral)"),
    }),
) {}

export class HyperlaneSendAssetsParameters extends createToolParameters(
    z.object({
        originChain: z.string().describe("Address of the chain sending assets"),
        destinationChain: z.string().describe("Address of the chain receiving assets"),
        tokenAddress: z
            .string()
            .regex(/^0x[a-fA-F0-9]{40}$/)
            .describe("Origin chain token contract address"),
        warpRouteAddress: z.string().describe("Origin chain warp route address"),
        recipientAddress: z.string().describe("Address of the wallet receiving assets"),
        amount: z.string().describe("Amount to send"),
    }),
) {}

export class HyperlaneGetWarpRoutesForChainParameters extends createToolParameters(
    z.object({
        chain: z.string().describe("Chain name (e.g. base, arbitrum)"),
    }),
) {}
