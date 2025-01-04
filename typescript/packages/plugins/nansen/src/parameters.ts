import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

const addressSchema = z.object({
    address: z.string().describe("Ethereum address to get details for"),
});

const chainSchema = z.enum(["ethereum", "polygon", "bsc"]).describe("Blockchain network");

export class GetAddressDetailsParams extends createToolParameters(addressSchema) {}

export class GetTokenDetailsParams extends createToolParameters(
    z.object({
        address: z.string().describe("Token contract address"),
        chain: chainSchema,
    }).strict(),
) {}

export class GetNFTDetailsParams extends createToolParameters(
    z.object({
        address: z.string().describe("NFT contract address"),
        chain: chainSchema,
        tokenId: z.string().optional().describe("Specific NFT token ID"),
    }).strict(),
) {}

export class GetSmartMoneyParams extends createToolParameters(
    z.object({
        address: z.string().describe("Address to check smart money status"),
        chain: chainSchema,
    }).strict(),
) {}

export class GetEntityDetailsParams extends createToolParameters(
    z.object({
        entityId: z.string().describe("Nansen entity ID"),
    }).strict(),
) {}

export class GetExchangeFlowsParams extends createToolParameters(
    z.object({
        exchange: z.string().describe("Exchange name or address"),
        token: z.string().optional().describe("Specific token address to filter by"),
        timeframe: z.enum(["1h", "24h", "7d", "30d"]).default("24h").describe("Time period for flow data"),
    }).strict(),
) {}

export class GetSignalParams extends createToolParameters(
    z.object({
        signalId: z.string().describe("Nansen signal ID"),
        parameters: z.record(z.any()).optional().describe("Additional parameters required by the signal"),
    }).strict(),
) {}
