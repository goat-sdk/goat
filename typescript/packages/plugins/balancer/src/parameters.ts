import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

const hexAddress = z.string().regex(/^0x[a-fA-F0-9]{40}$/);

export class SwapParameters extends createToolParameters(
    z.object({
        tokenIn: hexAddress.describe("The address of the input token"),
        tokenOut: hexAddress.describe("The address of the output token"),
        tokenInDecimals: z.number().describe("The number of decimals for the input token"),
        tokenOutDecimals: z.number().describe("The number of decimals for the output token"),
        amountIn: z.string().describe("The amount of input tokens to swap (in basis points/wei)"),
        slippage: z.string().default("0.1").describe("Maximum slippage allowed (in percentage)"),
        deadline: z.number().optional().describe("Transaction deadline (in seconds)"),
        wethIsEth: z.boolean().default(false).describe("Whether to use ETH instead of WETH"),
    })
) {}

const TokenAmount = z.object({
    token: hexAddress.describe("Token address"),
    amount: z.string().describe("Token amount (in basis points/wei)"),
    decimals: z.number().describe("Token decimals"),
});

export class LiquidityParameters extends createToolParameters(
    z.object({
        pool: hexAddress.describe("The address of the Balancer pool"),
        amounts: z.array(TokenAmount).describe("Array of token amounts to add as liquidity"),
        slippage: z.string().default("0.1").describe("Maximum slippage allowed (in percentage)"),
        deadline: z.number().optional().describe("Transaction deadline (in seconds)"),
        wethIsEth: z.boolean().default(false).describe("Whether to use ETH instead of WETH"),
    })
) {} 