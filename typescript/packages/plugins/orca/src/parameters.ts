import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

export class CreateSingleSidedPoolParameters extends createToolParameters(
    z.object({
        depositTokenAmount: z
            .string()
            .describe("The amount of the deposit token (including the decimals) to contribute to the pool."),
        depositTokenMint: z
            .string()
            .describe("The mint address of the token being deposited into the pool, eg. NEW_TOKEN."),
        otherTokenMint: z.string().describe("The mint address of the other token in the pool, eg. USDC."),
        startPrice: z
            .string()
            .describe("The initial start price of the deposit token in terms of the other token, eg. 0.001 USDC."),
        maxPrice: z.string().describe("The initial maximum price of the token."),
        feeTier: z.string().describe(
            "The fee tier percentage for the pool, determining tick spacing and fee collection rates. \
            Available fee tiers are 0.01, 0.02, 0.04, 0.05, 0.16, 0.30, 0.65, 1.0, 2.0",
        ),
    }),
) {}
