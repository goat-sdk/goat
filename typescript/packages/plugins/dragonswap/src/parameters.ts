import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

// Update the hex address validation to be more lenient with case sensitivity
const hexAddress = z.string().regex(/^0x[a-fA-F0-9]{40}$/i);

export class ExactInputSingleParameters extends createToolParameters(
    z.object({
        tokenIn: hexAddress.describe("The address of the input token"),
        tokenOut: hexAddress.describe("The address of the output token"),
        fee: z.number().describe("The fee tier of the pool, denominated in hundredths of a bip"),
        recipient: hexAddress.optional().describe("The address to receive the output tokens"),
        deadline: z.number().describe("The unix timestamp after which a swap will fail"),
        amountIn: z.string().describe("The amount of input tokens to send"),
        amountOutMinimum: z.string().describe("The minimum amount of output tokens to receive"),
        sqrtPriceLimitX96: z.string().optional().describe("The price limit for the trade"),
    })
) {}

export class AddLiquidityParameters extends createToolParameters(
    z.object({
        token0: hexAddress.describe("The address of token0"),
        token1: hexAddress.describe("The address of token1"),
        fee: z.number().describe("The fee tier of the pool"),
        tickLower: z.number().describe("The lower tick of the position"),
        tickUpper: z.number().describe("The upper tick of the position"),
        amount0Desired: z.string().describe("The desired amount of token0 to deposit"),
        amount1Desired: z.string().describe("The desired amount of token1 to deposit"),
        amount0Min: z.string().describe("The minimum amount of token0 to deposit"),
        amount1Min: z.string().describe("The minimum amount of token1 to deposit"),
        recipient: hexAddress.describe("The address that receives the liquidity position"),
        deadline: z.number().describe("The unix timestamp after which the transaction will fail"),
    })
) {}

export class RemoveLiquidityParameters extends createToolParameters(
    z.object({
        tokenId: z.string().describe("The ID of the token to remove liquidity from"),
        liquidity: z.string().describe("The amount of liquidity to remove"),
        amount0Min: z.string().describe("The minimum amount of token0 to receive"),
        amount1Min: z.string().describe("The minimum amount of token1 to receive"),
        deadline: z.number().describe("The unix timestamp after which the transaction will fail"),
    })
) {}

export class CollectFeesParameters extends createToolParameters(
    z.object({
        tokenId: z.string().describe("The ID of the NFT"),
        recipient: hexAddress.describe("The address to receive the collected fees"),
        amount0Max: z.string().describe("The maximum amount of token0 to collect"),
        amount1Max: z.string().describe("The maximum amount of token1 to collect"),
    })
) {}
