import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

const quoteShape = {
    toChainId: z
        .number()
        .optional()
        .describe(
            "Destination chain ID for cross-chain swaps (e.g. 8453 Base, 42161 Arbitrum, 792703809 Solana, 8253038 Bitcoin, 728126428 Tron). Defaults to the wallet's chain",
        ),
    fromToken: z
        .string()
        .describe(
            "Token to sell: contract address, or 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE for the native token",
        ),
    toToken: z.string().describe("Token to buy: contract address / Solana mint, or the native token address"),
    amount: z.string().describe("Amount of fromToken to sell, in base units (integer string)"),
    slippageBps: z.number().optional().describe("Max slippage in basis points (default 50)"),
    toAddress: z
        .string()
        .optional()
        .describe("Recipient on the destination chain. Required when the destination is a non-EVM chain"),
};

export class GetQuoteParameters extends createToolParameters(z.object(quoteShape)) {}
export class SwapParameters extends createToolParameters(z.object(quoteShape)) {}
