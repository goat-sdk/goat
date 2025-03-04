import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

export class StakeMoeParams extends createToolParameters(
    z.object({
        amount: z.string().describe("Amount of MOE to stake"),
    }),
) {}

export class UnstakeMoeParams extends createToolParameters(
    z.object({
        amount: z.string().describe("Amount of MOE to unstake"),
    }),
) {}

export class SwapParams extends createToolParameters(
    z.object({
        amountIn: z.string().describe("Amount of input tokens to swap"),
        amountOutMin: z.string().describe("Minimum amount of output tokens to receive"),
        path: z.array(z.string()).describe("Array of token addresses representing the swap path"),
        to: z.string().describe("Address to receive the output tokens"),
        deadline: z.number().describe("Unix timestamp deadline for the swap"),
    }),
) {}

export class GetPairParams extends createToolParameters(
    z.object({
        tokenA: z.string().describe("Address of the first token"),
        tokenB: z.string().describe("Address of the second token"),
    }),
) {}

export class GetBalanceParams extends createToolParameters(
    z.object({
        address: z.string().describe("Address to check balance for"),
    }),
) {}

export class GetAmountsOutParams extends createToolParameters(
    z.object({
        amountIn: z.string().describe("Amount of input tokens"),
        path: z.array(z.string()).describe("Array of token addresses representing the swap path"),
    }),
) {} 

export class GetPairAtIndexParams extends createToolParameters(
    z.object({
        index: z.number().describe("Index of the pair to get"),
    }),
) {}
