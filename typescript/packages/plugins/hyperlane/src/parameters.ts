import { createToolParameters } from "@goat-sdk/core";
import { IsmType, TokenStandard, TokenType } from "@hyperlane-xyz/sdk";
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
        destinationChain: z.string().describe("Destination chain name"),
        type: z.enum(Object.values(IsmType) as [string, ...string[]]).describe("Type of ISM to configure"),
        originChain: z.string().optional().describe("Origin chain name"),
        validators: z
            .array(
                z.object({
                    signingAddress: z.string().describe("Address that will sign messages"),
                    weight: z.number().optional().describe("Validator's voting weight (for weighted multisig)"),
                }),
            )
            .optional()
            .describe("List of validators with their signing addresses and optional weights"),
        threshold: z
            .number()
            .optional()
            .describe(
                "Minimum number of validator signatures (for multisig) or sum of weights (for weighted multisig) required",
            ),
        thresholdWeight: z
            .number()
            .optional()
            .describe("Alternative to threshold for weighted multisig - minimum sum of weights required"),
        owner: z.string().optional().describe("Address with administrative rights over the ISM"),
        paused: z.boolean().optional().describe("Whether message verification is paused"),
        ownerOverrides: z.record(z.string()).optional().describe("Chain-specific owner address overrides"),
        relayer: z.string().optional().describe("Address of the relayer for routing ISM"),
        nativeBridge: z.string().optional().describe("Address of the native bridge contract"),
        bridge: z.string().optional().describe("Address of the bridge contract"),
        domains: z.record(z.string()).optional().describe("Chain-specific owner address overrides"),
        modules: z.array(z.string()).optional().describe("List of modules to include in the ISM"),
        mailbox: z
            .string()
            .optional()
            .describe("(Optional) Address of the Hyperlane mailbox contract that will use this ISM"),
        existingIsmAddress: z
            .string()
            .optional()
            .describe("(Optional) Address of an existing ISM to use instead of deploying a new one"),
    }),
) {}

export class HyperlaneValidatorParameters extends createToolParameters(
    z.object({
        chain: z.string().describe("Chain name (e.g. base, arbitrum)"),
        action: z.enum(["ADD", "REMOVE", "UPDATE"]).describe("The action to perform on the validator"),
        validator: z.string().describe("Validator address"),
        weight: z.number().optional().describe("Validator weight for weighted multisig"),
    }),
) {}

export class HyperlaneGetTokenParameters extends createToolParameters(
    z.object({
        chain: z.string().describe("Chain name (e.g. base, arbitrum)"),
        tokenSymbol: z.string().optional().describe("Token symbol to search for (e.g. USDC)"),
        standard: z
            .enum(Object.values(TokenStandard) as [string, ...string[]])
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
        chains: z.array(
            z.object({
                chainName: z.string().min(1).describe("The origin chain name (e.g. ethereum, baseSepolia)"),
                type: z.enum(Object.values(TokenType) as [string, ...string[]]).describe("Token type"),
                tokenAddress: z
                    .string()
                    .regex(/^0x[a-fA-F0-9]{40}$/)
                    .optional()
                    .describe("ERC20 token address on the origin chain (not required for native token type)"),
                isNft: z.boolean().optional().describe("If using collateral for an ERC721 contract, set to true."),
                proxyAdmin: z
                    .object({
                        // TODO: ask if they want a proxy admin fist
                        address: z
                            .string()
                            .describe(
                                "The specific deployed ProxyAdmin contract address. If omitted, it may be deployed automatically",
                            ),
                        owner: z
                            .string()
                            .optional()
                            .describe("The default address with administrative rights over the proxy."), // owner address by default
                        ownerOverrides: z
                            .record(z.any())
                            .optional()
                            .describe("A per-chain mapping to override the default owner on specific networks"),
                    })
                    .optional()
                    .describe("Defines the administrative controller of the proxy contract"),
                useTrustedIsm: z.boolean().describe("Do you want to use a trusted ISM for warp route?"),
                interchainSecurityModule: z
                    .string()
                    .optional()
                    .describe("Address of an interchain security modules to verify interchain messages"),
                // TODO: update to ism type, ask for it if the answer to useTrustedIsm is false
                // interchainSecurityModule:
                //         modules:
                //         - relayer: "0x0Ef3456E616552238B0c562d409507Ed6051A7b3"
                //             type: trustedRelayerIsm
                //         - domains: {}
                //             owner: "0x0Ef3456E616552238B0c562d409507Ed6051A7b3"
                //             type: defaultFallbackRoutingIsm
                //         threshold: 1
                //         type: staticAggregationIsm
                //
                // The following parameters aren't ask for in `hyperlane warp init` but can be added to the config
                mailbox: z.string().optional().describe("Address of the mailbox contract to send/receive messages"),
                symbol: z.string().optional().describe("Token symbol"),
                name: z.string().optional().describe("Token name"),
                decimals: z.number().optional().describe("Number of decimal places for the token"),
                scale: z.number().optional().describe("Scale of the token"),
            }),
        ),
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

export class HyperlaneGetIsmsForChainParameters extends createToolParameters(
    z.object({
        chain: z.string().describe("Chain name (e.g. base, arbitrum)"),
    }),
) {}

export class HyperlaneIsmConfigParameters extends createToolParameters(
    z.object({
        destinationWarpRouteAddress: z.string().describe("Address of the warp route on the destination chain"),
        ismAddress: z.string().describe("Address of the ISM"),
        // originChain: z.string().describe("Origin chain name (e.g. base, arbitrum)"),
        // destinationChain: z.string().describe("Destination chain name (e.g. base, arbitrum)"),
        // relayerAddress: z.string().describe("Address of the relayer to configure"),
        // whitelist: z.array(z.string()).optional().describe("Whitelisted addresses for message processing"),
        // blacklist: z.array(z.string()).optional().describe("Blacklisted addresses for message processing"),
        // gasPaymentConfig: z
        //     .object({
        //         minGas: z.number().describe("Minimum gas required for message processing"),
        //         maxGas: z.number().describe("Maximum gas allowed for message processing"),
        //         gasToken: z.string().describe("Gas token address for payments"),
        //     })
        //     .optional()
        //     .describe("Gas payment configuration"),
    }),
) {}
