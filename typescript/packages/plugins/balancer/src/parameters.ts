import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

export class SwapParameters extends createToolParameters(
    z.object({
        tokenIn: z.string().describe("The address of the input token"),
        tokenOut: z.string().describe("The address of the output token"),
        amountIn: z.string().describe("The amount of input tokens to swap"),
        slippage: z.string().default("0.1").describe("Maximum slippage allowed (in percentage)"),
        deadline: z.number().optional().describe("Transaction deadline (in seconds)"),
        wethIsEth: z.boolean().default(false).describe("Whether to use ETH instead of WETH"),
    })
) {}

const TokenAmount = z.object({
    token: z.string().describe("Token address"),
    amount: z.string().describe("Token amount"),
    decimals: z.number().describe("Token decimals"),
});

export class LiquidityParameters extends createToolParameters(
    z.object({
        pool: z.string().describe("The address of the Balancer pool"),
        amounts: z.array(TokenAmount).describe("Array of token amounts to add as liquidity"),
        slippage: z.string().default("0.1").describe("Maximum slippage allowed (in percentage)"),
        deadline: z.number().optional().describe("Transaction deadline (in seconds)"),
        wethIsEth: z.boolean().default(false).describe("Whether to use ETH instead of WETH"),
    })
) {} 