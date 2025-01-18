import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

export class SwapExactTokensParams extends createToolParameters(
    z.object({
        tokenIn: z.string().describe("The address of the token to swap from"),
        tokenOut: z.string().describe("The address of the token to swap to"),
        amountIn: z.string().describe("The amount of input tokens to swap in base units"),
        amountOutMin: z.string().describe("The minimum amount of output tokens to receive in base units"),
        stable: z.boolean().describe("Whether to use stable or volatile pool for swap"),
        to: z.string().optional().describe("The address to receive the output tokens"),
        deadline: z
            .number()
            .optional()
            .default(60 * 60 * 24)
            .describe("The deadline for the swap in seconds from now"),
    }),
) {}

export class AddLiquidityParams extends createToolParameters(
    z.object({
        token0: z.string().describe("The address of the first token"),
        token1: z.string().describe("The address of the second token"),
        stable: z.boolean().describe("Whether this is a stable or volatile pool"),
        amount0Desired: z.string().describe("The desired amount of first token to add in base units"),
        amount1Desired: z.string().describe("The desired amount of second token to add in base units"),
        amount0Min: z.string().describe("The minimum amount of first token to add in base units"),
        amount1Min: z.string().describe("The minimum amount of second token to add in base units"),
        to: z.string().optional().describe("The address to receive the LP tokens"),
        deadline: z
            .number()
            .optional()
            .default(60 * 60 * 24)
            .describe("The deadline for the transaction in seconds from now"),
    }),
) {}
