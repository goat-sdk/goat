import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

export class SwapQuoteParameters extends createToolParameters(
    z.object({
        tokenIn: z
            .string()
            .describe(
                "Input token address. Use 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE for native token (ETH, MATIC, etc.)",
            ),
        tokenOut: z
            .string()
            .describe(
                "Output token address. Use 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE for native token",
            ),
        amount: z.string().describe("Input amount in wei (smallest unit)"),
        maxSlippage: z
            .number()
            .optional()
            .describe("Maximum slippage tolerance from 0 to 1 (default 0.005 = 0.5%)"),
    }),
) {}

export class ExecuteSwapParameters extends createToolParameters(
    z.object({
        tokenIn: z
            .string()
            .describe(
                "Input token address. Use 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE for native token (ETH, MATIC, etc.)",
            ),
        tokenOut: z
            .string()
            .describe(
                "Output token address. Use 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE for native token",
            ),
        amount: z.string().describe("Input amount in wei (smallest unit)"),
        maxSlippage: z
            .number()
            .optional()
            .describe("Maximum slippage tolerance from 0 to 1 (default 0.005 = 0.5%)"),
    }),
) {}
