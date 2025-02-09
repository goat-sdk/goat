import { z } from "zod";
import { Chain } from "@goat-sdk/core";

// Basic parameter schemas
export const AddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/);
export const Bytes32Schema = z.string().regex(/^0x[a-fA-F0-9]{64}$/);
export const AmountSchema = z.string().regex(/^\d+$/);

// Simplified Chain validation
export const ChainSchema = z.custom<Chain>((data) => {
    return data !== null && typeof data === 'object' && 'type' in data;
}, {
    message: "Invalid chain configuration"
});

// Message Parameters
export const SendMessageParamsSchema = z.object({
    destinationChainId: z.number(),  // Changed to use chain ID instead of full chain object
    recipient: AddressSchema,
    messageBody: z.string(),
    gasAmount: AmountSchema.optional()
});

// Token Bridge Parameters
export const TokenBridgeParamsSchema = z.object({
    tokenAddress: AddressSchema,
    amount: AmountSchema,
    destinationChainId: z.number(),  // Changed to use chain ID instead of full chain object
    recipient: AddressSchema,
    bridgeType: z.enum(['NATIVE', 'ERC20', 'SYNTHETIC', 'COLLATERAL'])
});

// Interchain Account Parameters
export const ICACallSchema = z.object({
    to: AddressSchema,
    value: AmountSchema,
    data: z.string()
});

export const ICAParamsSchema = z.object({
    destinationChainId: z.number(),  // Changed to use chain ID instead of full chain object
    calls: z.array(ICACallSchema)
});

// Configuration Parameters
export const HyperlaneConfigSchema = z.object({
    chain: ChainSchema,
    mailboxAddress: AddressSchema.optional(),
    interchainGasPaymaster: AddressSchema.optional(),
    defaultISM: AddressSchema.optional(),
    rpcUrl: z.string().url().optional(),
    apiKey: z.string().optional(),
    customRouterAddress: AddressSchema.optional(),
    gasLimitOverride: z.number().positive().optional(),
    timeout: z.number().positive().optional()
});

// Export parameter types
export type SendMessageParams = z.infer<typeof SendMessageParamsSchema>;
export type TokenBridgeParams = z.infer<typeof TokenBridgeParamsSchema>;
export type ICAParams = z.infer<typeof ICAParamsSchema>;
export type HyperlaneConfig = z.infer<typeof HyperlaneConfigSchema>;

// Tool parameters
export const TOOL_PARAMS = {
    SEND_MESSAGE: {
        name: "sendMessage",
        description: "Send a message to another chain via Hyperlane",
        parameters: SendMessageParamsSchema
    },
    BRIDGE_TOKEN: {
        name: "bridgeToken",
        description: "Bridge tokens between chains using Hyperlane",
        parameters: TokenBridgeParamsSchema
    },
    EXECUTE_ICA_CALLS: {
        name: "executeICACalls",
        description: "Execute calls through an interchain account",
        parameters: ICAParamsSchema
    }
} as const;

// Default configurations
export const DEFAULT_CONFIG = {
    timeout: 300000, // 5 minutes
    gasLimitOverride: 500000
} as const;