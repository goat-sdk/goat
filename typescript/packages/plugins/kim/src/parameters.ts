import { z } from "zod";
import { createToolParameters } from "@goat-sdk/core";



// export const pathSchema = z.object({
//     tokenIn: z.string(),  // First token in the path
//     tokenOut: z.string(), // Last token in the path
//     // For multi-hop swaps, we need the intermediate tokens
//     intermediateTokens: z.array(z.string()).optional(),
// });


export class exactInput extends createToolParameters(
    z.object({
        path: z.any().describe("The path of the swap"),
        recipient: z.string().describe("The address to receive the output tokens"),
        deadline: z.number().describe("The deadline for the swap"),
        amountIn: z.string().describe("The amount of tokens to swap in"),
        amountOutMinimum: z.string().describe("The minimum amount of tokens to receive"),
    })
) {}

export class exactOutput extends createToolParameters(
    z.object({
        path: z.any().describe("The path of the swap"),
        recipient: z.string().describe("The address to receive the output tokens"),
        deadline: z.number().describe("The deadline for the swap"),
        amountOut: z.string().describe("The amount of tokens to swap out"),
        amountInMaximum: z.string().describe("The maximum amount of tokens to swap in"),
    })
) {}


export class exactInputSingleSchema extends createToolParameters(
    z.object({
        tokenIn: z.string().describe("The token to swap in"),
        tokenOut: z.string().describe("The token to swap out"),
        recipient: z.string().describe("The address to receive the output tokens"),
        deadline: z.number().describe("The deadline for the swap"),
        amountIn: z.string().describe("The amount of tokens to swap in"),
        amountOutMinimum: z.string().describe("The minimum amount of tokens to receive"),
        limitSqrtPrice: z.string().describe("The limit price for the swap"),
    })
) {}

export class exactOutputSingleSchema extends createToolParameters(
    z.object({
        tokenIn: z.string().describe("The token to swap in"),
        tokenOut: z.string().describe("The token to swap out"),
        recipient: z.string().describe("The address to receive the output tokens"),
        deadline: z.number().describe("The deadline for the swap"),
        amountOut: z.string().describe("The amount of tokens to swap out"),
        amountInMaximum: z.string().describe("The maximum amount of tokens to swap in"),
        limitSqrtPrice: z.string().describe("The limit price for the swap"),
    })
) {}


export class defaultConfigurationForPoolSchema extends createToolParameters(
    z.object({
        poolAddress: z.string().describe("The address of the pool"),
    }),
) {}

export class poolByPairSchema extends createToolParameters(
    z.object({
        token0: z.string().describe("The first token in the pair"),
        token1: z.string().describe("The second token in the pair"),
    }),
) {}

export const MintResponseSchema = z.object({
    tokenId: z.string().describe("The ID of the minted NFT position"),
    liquidity: z.string().describe("The amount of liquidity added"),
    amount0: z.string().describe("The amount of token0 used"),
    amount1: z.string().describe("The amount of token1 used"),
});

export class mintSchema extends createToolParameters(
    z.object({
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
    })
) {}


export const increaseLiquidityResponseSchema = z.object({
    liquidity: z.string().describe("The amount of liquidity added"),
    amount0: z.string().describe("The amount of token0 used"),
    amount1: z.string().describe("The amount of token1 used"),
});

export class increaseLiquiditySchema extends createToolParameters(
    z.object({
        tokenId: z.string().describe("The token id of the liquidity"),
        amount0Desired: z.string().describe("The amount of token0 to add"),
        amount1Desired: z.string().describe("The amount of token1 to add"),
        amount0Min: z.string().describe("The minimum amount of token0 to add"),
        amount1Min: z.string().describe("The minimum amount of token1 to add"),
        deadline: z.number().describe("The deadline for the swap"),
    })
) {}


export const decreaseLiquidityResponseSchema = z.object({
    liquidity: z.string().describe("The amount of liquidity removed"),
    amount0: z.string().describe("The amount of token0 used"),
    amount1: z.string().describe("The amount of token1 used"),
});

export class decreaseLiquiditySchema extends createToolParameters(
    z.object({
        tokenId: z.string().describe("The token id of the liquidity"),
        liquidity: z.string().describe("The amount of liquidity to remove"),
        amount0Min: z.string().describe("The minimum amount of token0 to remove"),
        amount1Min: z.string().describe("The minimum amount of token1 to remove"),
        deadline: z.number().describe("The deadline for the swap"),
    })
) {}


export const collectResponseSchema = z.object({
    amount0: z.string().describe("The amount of token0 collected"),
    amount1: z.string().describe("The amount of token1 collected"),
});

export class collectSchema extends createToolParameters(
    z.object({
        tokenId: z.string().describe("The token id of the liquidity"),
        recipient: z.string().describe("The address to receive the output tokens"),
        amount0Max: z.string().describe("The maximum amount of token0 to collect"),
        amount1Max: z.string().describe("The maximum amount of token1 to collect"),
    })
) {}

export class burnSchema extends createToolParameters(
    z.object({
        tokenId: z.string().describe("The token id of the liquidity position to be burned"),
    })
) {}


