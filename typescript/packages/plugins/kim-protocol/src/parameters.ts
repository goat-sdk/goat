import { z } from "zod";

export const SwapExactTokensForTokensParameters = z.object({
    tokenIn: z.string().describe("The address of the input token"),
    tokenOut: z.string().describe("The address of the output token"),
    amountIn: z.string().describe("The amount of input tokens to swap"),
    amountOutMinimum: z.string().describe("The minimum amount of output tokens to receive"),
    recipient: z.string().describe("The address that will receive the output tokens"),
    deadline: z.number().optional().describe("Optional deadline for the transaction (timestamp)"),
    limitSqrtPrice: z.string().optional().describe("Optional price limit for the swap")
});

export const AddLiquidityParameters = z.object({
    token0: z.string().describe("The address of the first token"),
    token1: z.string().describe("The address of the second token"),
    tickLower: z.number().describe("The lower tick of the position"),
    tickUpper: z.number().describe("The upper tick of the position"),
    amount0Desired: z.string().describe("The desired amount of token0 to add"),
    amount1Desired: z.string().describe("The desired amount of token1 to add"),
    amount0Min: z.string().describe("The minimum amount of token0 to add"),
    amount1Min: z.string().describe("The minimum amount of token1 to add"),
    recipient: z.string().describe("The address that will receive the liquidity tokens"),
    deadline: z.number().optional().describe("Optional deadline for the transaction (timestamp)")
}); 