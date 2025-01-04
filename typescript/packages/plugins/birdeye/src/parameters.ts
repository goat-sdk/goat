import { z } from "zod";

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

export const defiNetworksParametersSchema = z.object({});

export const defiPriceParametersSchema = z.object({
    chain: chainSchema,
    address: z.string().describe("Token contract address"),
});

export const defiMultiPriceParametersSchema = z.object({
    chain: chainSchema,
    addresses: z.array(z.string()).max(100).describe("Array of token contract addresses (max 100)"),
});

export const defiHistoryPriceParametersSchema = z.object({
    chain: chainSchema,
    address: z.string().describe("Token contract address"),
    type: z.enum(["1H", "4H", "12H", "1D", "1W", "1M"]).describe("Time interval"),
    limit: z.number().optional().describe("Number of data points to return"),
});

export const defiHistoricalPriceUnixParametersSchema = z.object({
    chain: chainSchema,
    address: z.string().describe("Token contract address"),
    timestamp: z.number().describe("Unix timestamp"),
});

export const defiTokenTxsParametersSchema = z.object({
    chain: chainSchema,
    address: z.string().describe("Token contract address"),
    page: z.number().optional().describe("Page number"),
    limit: z.number().optional().describe("Number of items per page"),
});

export const defiPairTxsParametersSchema = z.object({
    chain: chainSchema,
    pair_address: z.string().describe("Pair contract address"),
    page: z.number().optional().describe("Page number"),
    limit: z.number().optional().describe("Number of items per page"),
});

export const defiTxsSeekByTimeParametersSchema = z.object({
    chain: chainSchema,
    address: z.string().describe("Token or pair contract address"),
    from_time: z.number().describe("Start timestamp"),
    to_time: z.number().describe("End timestamp"),
    limit: z.number().optional().describe("Number of items to return"),
});

export const defiOhlcvParametersSchema = z.object({
    chain: chainSchema,
    address: z.string().describe("Token contract address"),
    type: z.enum(["1H", "4H", "12H", "1D", "1W", "1M"]).describe("Time interval"),
    limit: z.number().optional().describe("Number of data points to return"),
});

export const defiOhlcvPairParametersSchema = z.object({
    chain: chainSchema,
    pair_address: z.string().describe("Pair contract address"),
    type: z.enum(["1H", "4H", "12H", "1D", "1W", "1M"]).describe("Time interval"),
    limit: z.number().optional().describe("Number of data points to return"),
});

export const defiOhlcvBaseQuoteParametersSchema = z.object({
    chain: chainSchema,
    base_address: z.string().describe("Base token contract address"),
    quote_address: z.string().describe("Quote token contract address"),
    type: z.enum(["1H", "4H", "12H", "1D", "1W", "1M"]).describe("Time interval"),
    limit: z.number().optional().describe("Number of data points to return"),
});

export const defiPriceVolumeSingleParametersSchema = z.object({
    chain: chainSchema,
    address: z.string().describe("Token contract address"),
});

export const defiPriceVolumeMultiParametersSchema = z.object({
    chain_id: z.number(),
    token_addresses: z.array(z.string()).max(50).describe("Array of token contract addresses (max 50)"),
});
