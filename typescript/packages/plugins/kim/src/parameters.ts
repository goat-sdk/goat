import { z } from "zod";
import { createToolParameters } from "@goat-sdk/core";

export const pathSchema = z.object({
    tokenIn: z.string().describe("First token in the path"),
    tokenOut: z.string().describe("Last token in the path"),
    intermediateTokens: z.array(z.string()).describe("Intermediate tokens in the path"),
    fees: z.array(z.number()).describe("Fee tiers between each hop"),
});

export const exactInputSchema = z.object({
    path: pathSchema.describe("The path of the swap"),
    recipient: z.string().describe("The address to receive the output tokens"),
    deadline: z.number().describe("The deadline for the swap"),
    amountIn: z.string().describe("The amount of tokens to swap in"),
    amountOutMinimum: z.string().describe("The minimum amount of tokens to receive"),
});

export const exactOutputSchema = z.object({
    path: z.any().describe("The path of the swap"),
    recipient: z.string().describe("The address to receive the output tokens"),
    deadline: z.number().describe("The deadline for the swap"),
    amountOut: z.string().describe("The amount of tokens to swap out"),
    amountInMaximum: z.string().describe("The maximum amount of tokens to swap in"),
});

export const exactInputSingleSchema = z.object({
    tokenIn: z.string().describe("The token to swap in"),
    tokenOut: z.string().describe("The token to swap out"),
    recipient: z.string().describe("The address to receive the output tokens"),
    deadline: z.number().describe("The deadline for the swap"),
    amountIn: z.string().describe("The amount of tokens to swap in"),
    amountOutMinimum: z.string().describe("The minimum amount of tokens to receive"),
    limitSqrtPrice: z.string().describe("The limit price for the swap"),
});

export const exactOutputSingleSchema = z.object({
    tokenIn: z.string().describe("The token to swap in"),
    tokenOut: z.string().describe("The token to swap out"),
    recipient: z.string().describe("The address to receive the output tokens"),
    deadline: z.number().describe("The deadline for the swap"),
    amountOut: z.string().describe("The amount of tokens to swap out"),
    amountInMaximum: z.string().describe("The maximum amount of tokens to swap in"),
    limitSqrtPrice: z.string().describe("The limit price for the swap"),
});

export const defaultConfigurationForPoolSchema = z.object({
    poolAddress: z.string().describe("The address of the pool"),
});

export const poolByPairSchema = z.object({
    token0: z.string().describe("The first token in the pair"),
    token1: z.string().describe("The second token in the pair"),
});

export const MintResponseSchema = z.object({
    tokenId: z.string().describe("The ID of the minted NFT position"),
    liquidity: z.string().describe("The amount of liquidity added"),
    amount0: z.string().describe("The amount of token0 used"),
    amount1: z.string().describe("The amount of token1 used"),
});

export const mintSchema = z.object({
    token0: z.string().describe("The first token in the pair"),
    token1: z.string().describe("The second token in the pair"),
    tickLower: z.number().describe("The lower tick for the liquidity"),
    tickUpper: z.number().describe("The upper tick for the liquidity"),
    amount0Desired: z.string().describe("The amount of token0 to add"),
    amount1Desired: z.string().describe("The amount of token1 to add"),
    amount0Min: z.string().describe("The minimum amount of token0 to add"),
    amount1Min: z.string().describe("The minimum amount of token1 to add"),
    recipient: z.string().describe("The address to receive the output tokens"),
    deadline: z.number().describe("The deadline for the swap"),
});

export const increaseLiquidityResponseSchema = z.object({
    liquidity: z.string().describe("The amount of liquidity added"),
    amount0: z.string().describe("The amount of token0 used"),
    amount1: z.string().describe("The amount of token1 used"),
});

export const increaseLiquiditySchema = z.object({
    token0: z.string().describe("The first token in the pair"),
    token1: z.string().describe("The second token in the pair"),
    tokenId: z.string().describe("The token id of the liquidity"),
    amount0Desired: z.string().describe("The amount of token0 to add"),
    amount1Desired: z.string().describe("The amount of token1 to add"),
    amount0Min: z.string().describe("The minimum amount of token0 to add"),
    amount1Min: z.string().describe("The minimum amount of token1 to add"),
    deadline: z.number().describe("The deadline for the swap"),
});

export const decreaseLiquidityResponseSchema = z.object({
    token0: z.string().describe("The first token in the pair"),
    token1: z.string().describe("The second token in the pair"),
    tokenId: z.string().describe("The token id of the liquidity"),
    liquidity: z.string().describe("The amount of liquidity removed"),
    amount0: z.string().describe("The amount of token0 used"),
    amount1: z.string().describe("The amount of token1 used"),
});

export const decreaseLiquiditySchema = z.object({
    tokenId: z.string().describe("The token id of the liquidity"),
    liquidity: z.string().describe("The amount of liquidity to remove"),
    amount0Min: z.string().describe("The minimum amount of token0 to remove"),
    amount1Min: z.string().describe("The minimum amount of token1 to remove"),
    deadline: z.number().describe("The deadline for the swap"),
});

export const collectResponseSchema = z.object({
    amount0: z.string().describe("The amount of token0 collected"),
    amount1: z.string().describe("The amount of token1 collected"),
});

export const collectSchema = z.object({
    tokenId: z.string().describe("The token id of the liquidity"),
    recipient: z.string().describe("The address to receive the output tokens"),
    amount0Max: z.string().describe("The maximum amount of token0 to collect"),
    amount1Max: z.string().describe("The maximum amount of token1 to collect"),
});

export const burnSchema = z.object({
    tokenId: z.string().describe("The token id of the liquidity position to be burned"),
});

export const globalStateResponseSchema = z.object({
    price: z.string().describe("The current price of the pool"),
    tick: z.number().describe("The current tick of the pool"),
    lastFee: z.number().describe("The current (last known) fee in hundredths of a bip"),
    pluginCongig: z.number().describe("The current plugin config as bitmap"),
    communityFee: z.number().describe("The community fee represented as a percent of all collected fee in thousandths"),
    unlocked: z.boolean().describe("Whether the pool is unlocked"),
})


