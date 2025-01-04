import { createToolParameters, type ToolParametersStatic } from "@goat-sdk/core";
import { z } from "zod";

const AddressDetailsSchema = z.object({
    address: z.string().describe("Ethereum address to get details for"),
});
export class GetAddressDetailsParams implements ToolParametersStatic<typeof AddressDetailsSchema> {
    static schema = AddressDetailsSchema;
    constructor() {}
}

const TokenDetailsSchema = z.object({
    address: z.string().describe("Token contract address"),
    chain: z.enum(["ethereum", "polygon", "bsc"]).describe("Blockchain network"),
});
export class GetTokenDetailsParams implements ToolParametersStatic<typeof TokenDetailsSchema> {
    static schema = TokenDetailsSchema;
    constructor() {}
}

const NFTDetailsSchema = z.object({
    address: z.string().describe("NFT contract address"),
    chain: z.enum(["ethereum", "polygon", "bsc"]).describe("Blockchain network"),
    tokenId: z.string().optional().describe("Specific NFT token ID"),
});
export class GetNFTDetailsParams implements ToolParametersStatic<typeof NFTDetailsSchema> {
    static schema = NFTDetailsSchema;
    constructor() {}
}

const SmartMoneySchema = z.object({
    address: z.string().describe("Address to check smart money status"),
    chain: z.enum(["ethereum", "polygon", "bsc"]).describe("Blockchain network"),
});
export class GetSmartMoneyParams implements ToolParametersStatic<typeof SmartMoneySchema> {
    static schema = SmartMoneySchema;
    constructor() {}
}

const EntityDetailsSchema = z.object({
    entityId: z.string().describe("Nansen entity ID"),
});
export class GetEntityDetailsParams implements ToolParametersStatic<typeof EntityDetailsSchema> {
    static schema = EntityDetailsSchema;
    constructor() {}
}

const ExchangeFlowsSchema = z.object({
    exchange: z.string().describe("Exchange name or address"),
    token: z.string().optional().describe("Specific token address to filter by"),
    timeframe: z.enum(["1h", "24h", "7d", "30d"]).default("24h").describe("Time period for flow data"),
});
export class GetExchangeFlowsParams implements ToolParametersStatic<typeof ExchangeFlowsSchema> {
    static schema = ExchangeFlowsSchema;
    constructor() {}
}

const SignalSchema = z.object({
    signalId: z.string().describe("Nansen signal ID"),
    parameters: z.record(z.any()).optional().describe("Additional parameters required by the signal"),
});
export class GetSignalParams implements ToolParametersStatic<typeof SignalSchema> {
    static schema = SignalSchema;
    constructor() {}
}
