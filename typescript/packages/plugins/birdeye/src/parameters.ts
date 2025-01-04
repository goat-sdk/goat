import { z } from "zod";
import { createToolParameters } from "@goat-sdk/core";

export const supportedChains = [
    "solana",
    "ethereum",
    "arbitrum",
    "avalanche",
    "bsc",
    "optimism",
    "polygon",
    "base",
    "zksync",
    "sui",
] as const;

export type SupportedChain = (typeof supportedChains)[number];

export const chainSchema = z.enum(supportedChains).describe("Chain name (e.g., ethereum, solana)");

// Defi Price Parameters
export class DefiPriceParameters extends createToolParameters(
    z.object({
        address: z.string().describe("Token contract address"),
    }),
) {}

export class DefiMultiPriceParameters extends createToolParameters(
    z.object({
        token_addresses: z.array(z.string()).max(100).describe("Array of token contract addresses (max 100)"),
    }),
) {}

export class DefiHistoryPriceParameters extends createToolParameters(
    z.object({
        address: z.string().describe("Token contract address"),
        type: z.enum(["1H", "4H", "12H", "1D", "1W", "1M"]).describe("Time interval"),
        limit: z.number().optional().describe("Number of data points to return"),
    }),
) {}

export class DefiHistoricalPriceUnixParameters extends createToolParameters(
    z.object({
        address: z.string().describe("Token contract address"),
        timestamp: z.number().describe("Unix timestamp"),
    }),
) {}

// Transaction Parameters
export class TransactionHistoryParameters extends createToolParameters(
    z.object({
        address: z.string().describe("Token contract address"),
        limit: z.number().optional().describe("Number of items per page"),
        offset: z.number().optional().describe("Offset for pagination"),
    }),
) {}

export class WalletTransactionHistoryParameters extends createToolParameters(
    z.object({
        wallet: z.string().describe("Wallet address"),
        limit: z.number().optional().describe("Number of items per page"),
        offset: z.number().optional().describe("Offset for pagination"),
    }),
) {}

// Market Parameters
export class DefiOhlcvParameters extends createToolParameters(
    z.object({
        address: z.string().describe("Token contract address"),
        type: z.enum(["1H", "4H", "12H", "1D", "1W", "1M"]).describe("Time interval"),
        limit: z.number().optional().describe("Number of data points to return"),
    }),
) {}

export class DefiOhlcvPairParameters extends createToolParameters(
    z.object({
        pair_address: z.string().describe("Pair contract address"),
        type: z.enum(["1H", "4H", "12H", "1D", "1W", "1M"]).describe("Time interval"),
        limit: z.number().optional().describe("Number of data points to return"),
    }),
) {}

export class DefiOhlcvBaseQuoteParameters extends createToolParameters(
    z.object({
        base_address: z.string().describe("Base token contract address"),
        quote_address: z.string().describe("Quote token contract address"),
        type: z.enum(["1H", "4H", "12H", "1D", "1W", "1M"]).describe("Time interval"),
        limit: z.number().optional().describe("Number of data points to return"),
    }),
) {}

export class DefiPriceVolumeSingleParameters extends createToolParameters(
    z.object({
        address: z.string().describe("Token contract address"),
    }),
) {}

export class DefiPriceVolumeMultiParameters extends createToolParameters(
    z.object({
        token_addresses: z.array(z.string()).max(50).describe("Array of token contract addresses (max 50)"),
    }),
) {}
