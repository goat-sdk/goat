import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

const baseUnits = z.string().regex(/^[0-9]+$/, "Amount must be an integer string in the token's base units");

const slippageBps = z
    .number()
    .int()
    .min(1)
    .max(1000)
    .optional()
    .describe("Maximum slippage in basis points (default 50, max 1000)");

export class EvmQuoteParameters extends createToolParameters(
    z.object({
        tokenIn: z
            .string()
            .describe(
                "Address of the token to sell, or the native symbol (ETH, BNB, POL) for the chain's native asset",
            ),
        tokenOut: z
            .string()
            .describe("Address of the token to buy, or the native symbol (ETH, BNB, POL) for the chain's native asset"),
        amountIn: baseUnits.describe("Amount of tokenIn to sell, in base units (e.g. wei)"),
        slippageBps,
    }),
) {}

export class SolanaQuoteParameters extends createToolParameters(
    z.object({
        inputMint: z.string().describe("Mint address of the token to sell (use the wrapped SOL mint for SOL)"),
        outputMint: z.string().describe("Mint address of the token to buy (use the wrapped SOL mint for SOL)"),
        amount: baseUnits.describe("Amount of inputMint to sell, in base units (e.g. lamports)"),
        slippageBps,
    }),
) {}
