/**
 * @fileoverview Parameter schemas for DeBridge API interactions
 * Defines and validates the required parameters for various DeBridge operations
 */

import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

/**
 * Regular expressions for validating addresses
 */
const SOLANA_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

/**
 * Supported chain IDs from DLN API
 */
const SUPPORTED_CHAIN_IDS = [
    "1",
    "10",
    "56",
    "137",
    "8453",
    "42161",
    "43114",
    "59144",
    "7565164",
    "100000001",
    "100000002",
    "100000004",
    "100000005",
] as const;

/**
 * Interface representing a token's information from DeBridge API
 */
export interface TokenInfo {
    /** Token name */
    name: string;
    /** Token symbol */
    symbol: string;
    /** Token address */
    address: string;
    /** Token decimals */
    decimals: number;
}

/**
 * Interface representing the response from getTokenInfo
 */
export interface TokenInfoResponse {
    tokens: Record<string, TokenInfo>;
}

/**
 * Schema for parameters required to get token information
 */
export class getTokenInfoParametersSchema extends createToolParameters(
    z.object({
        /** Chain ID to query tokens for */
        chainId: z.string().describe("Chain ID to get token information for"),

        /** Optional token address to filter results */
        tokenAddress: z.string().optional().describe("Specific token address to query information for"),

        /** Optional search term to filter tokens by name or symbol */
        search: z.string().optional().describe("Search term to filter tokens by name or symbol"),
    }),
) {}

/**
 * Schema for parameters required to get a bridge quote
 * Used to estimate token amounts and fees for cross-chain transfers
 */
export class getBridgeQuoteParametersSchema extends createToolParameters(
    z.object({
        /** Chain ID of the source blockchain */
        srcChainId: z.string().describe("Source chain ID (e.g., '1' for Ethereum)"),

        /** Token address on the source chain to be bridged */
        srcChainTokenIn: z
            .string()
            .regex(/^0x[a-fA-F0-9]{40}$/, "Token address must be '0x0' for native token (ETH) or a valid EVM address"),

        /** Amount of tokens to bridge in base units (e.g., wei for ETH) */
        srcChainTokenInAmount: z.string().regex(/^\d+$/, "Amount must be a positive integer in token decimals"),

        /** Chain ID of the destination blockchain */
        dstChainId: z.string().describe("Destination chain ID (e.g., '56' for BSC, '7565164' for Solana)"),

        /** Token address on the destination chain to receive */
        dstChainTokenOut: z
            .string()
            .describe("Destination token address (EVM format for EVM chains, native format for Solana)"),

        /** Slippage percentage for the quote */
        slippage: z
            .string()
            .regex(/^\d+(\.\d+)?$/, "Slippage must be a valid percentage")
            .optional(),

        /** Whether to include operating expenses in the quote */
        prependOperatingExpenses: z
            .boolean()
            .optional()
            .default(true)
            .describe(
                "Whether to include operating expenses in the transaction. Always true for native token transfers.",
            ),
    }),
) {}

/**
 * Schema for parameters required to create a bridge order
 * Used to initiate a cross-chain token transfer
 */
export class createBridgeOrderParametersSchema extends createToolParameters(
    z.object({
        /** Chain ID of the source blockchain */
        srcChainId: z
            .enum(SUPPORTED_CHAIN_IDS)
            .describe("Source chain ID (e.g., '1' for Ethereum, '56' for BSC) where the cross-chain swap will start"),

        /** Token address on the source chain */
        srcChainTokenIn: z
            .string()
            .refine(
                (val) => EVM_ADDRESS_REGEX.test(val) || SOLANA_ADDRESS_REGEX.test(val),
                "Token address must be either a valid EVM address (0x-prefixed) or Solana address (base58)",
            )
            .describe(
                "Token address on source chain. For EVM: use 0x0000000000000000000000000000000000000000 for native token. For Solana: use proper token mint address",
            ),

        /** Amount of tokens to bridge */
        srcChainTokenInAmount: z
            .string()
            .regex(/^\d+$/, "Amount must be a positive integer in token base units (e.g., wei for ETH)")
            .describe("Amount of input tokens in base units (e.g., wei for ETH, 10^6 for USDT)"),

        /** Chain ID of the destination blockchain */
        dstChainId: z
            .enum(SUPPORTED_CHAIN_IDS)
            .describe("Destination chain ID (e.g., '7565164' for Solana)")
            .refine((val) => true, {
                message: "Destination chain must be different from source chain",
            }),

        /** Token address on the destination chain */
        dstChainTokenOut: z
            .string()
            .refine(
                (val) => EVM_ADDRESS_REGEX.test(val) || SOLANA_ADDRESS_REGEX.test(val),
                "Token address must be either a valid EVM address (0x-prefixed) or Solana address (base58)",
            )
            .describe("Full token address on destination chain."),

        /** Recipient address on the destination chain */
        dstChainTokenOutRecipient: z
            .string()
            .refine(
                (val) => EVM_ADDRESS_REGEX.test(val) || SOLANA_ADDRESS_REGEX.test(val),
                "Recipient address must be either a valid EVM address (0x-prefixed) or Solana address (base58)",
            )
            .describe(
                "Recipient address on destination chain. For EVM: use 0x-prefixed address. For Solana: use base58 wallet address. Required for transaction construction!",
            ),

        /** Sender's address */
        senderAddress: z
            .string()
            .regex(EVM_ADDRESS_REGEX, "Sender address must be a valid EVM address")
            .refine((addr) => addr !== "0x0000000000000000000000000000000000000000", {
                message: "Sender address cannot be the zero address",
            })
            .describe("The user's wallet address that will sign and send the transaction on the source chain"),

        /** Authority address on the source chain */
        srcChainOrderAuthorityAddress: z
            .string()
            .regex(EVM_ADDRESS_REGEX, "Authority address must be a valid EVM address")
            .refine((addr) => addr !== "0x0000000000000000000000000000000000000000", {
                message: "Authority address cannot be the zero address",
            })
            .describe(
                "Optional: The user's wallet address that can cancel/modify the order. If not provided, defaults to senderAddress.",
            )
            .optional(),

        /** Refund address on the source chain */
        srcChainRefundAddress: z
            .string()
            .regex(EVM_ADDRESS_REGEX, "Refund address must be a valid EVM address")
            .refine((addr) => addr !== "0x0000000000000000000000000000000000000000", {
                message: "Refund address cannot be the zero address",
            })
            .describe(
                "Optional: The user's wallet address to receive refunds if the transaction fails. Defaults to senderAddress.",
            )
            .optional(),

        /** Authority address on the destination chain */
        dstChainOrderAuthorityAddress: z
            .string()
            .refine(
                (val) => EVM_ADDRESS_REGEX.test(val) || SOLANA_ADDRESS_REGEX.test(val),
                "Authority address must be either a valid EVM address (0x-prefixed) or Solana address (base58)",
            )
            .refine((addr) => addr !== "0x0000000000000000000000000000000000000000", {
                message: "Authority address cannot be the zero address",
            })
            .describe("Optional: Authority address on destination chain. Defaults to dstChainTokenOutRecipient.")
            .optional(),

        /** Referral code */
        referralCode: z.string().optional(),

        /** Whether to include operating expenses */
        prependOperatingExpenses: z
            .boolean()
            .optional()
            .default(true)
            .describe(
                "Whether to include operating expenses in the transaction. Always true for native token transfers.",
            ),

        /** Optional app identifier */
        deBridgeApp: z.string().optional(),
    }),
) {}

/**
 * Schema for parameters required to execute a bridge transaction
 * Used to submit the final transaction to the blockchain
 */
export class executeBridgeTransactionParametersSchema extends createToolParameters(
    z.object({
        /** Transaction data required for execution */
        txData: z
            .object({
                /** Destination contract address */
                to: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Contract address must be a valid EVM address"),

                /** Encoded transaction data */
                data: z.string().regex(/^0x[a-fA-F0-9]*$/, "Transaction data must be valid hex"),

                /** Transaction value in base units */
                value: z.string().regex(/^\d+$/, "Value must be a positive integer in wei").optional(),
            })
            .describe("Transaction data from createBridgeOrder"),
    }),
) {}
