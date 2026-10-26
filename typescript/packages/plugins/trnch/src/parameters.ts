import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

const slippageBps = z
    .number()
    .int()
    .min(10)
    .max(5000)
    .optional()
    .describe("Max slippage in basis points (100 = 1%). Default 100.");

export class EmptyParameters extends createToolParameters(z.object({})) {}

export class GetHeatParameters extends createToolParameters(
    z.object({
        since: z
            .string()
            .optional()
            .describe("nextSince returned by the previous call, to get only new entries. Omit on the first call."),
    }),
) {}

export class BuyParameters extends createToolParameters(
    z.object({
        tokenId: z.string().optional().describe("Opaque token id from trnch_get_heat. Use this or token."),
        token: z.string().optional().describe("Token contract address to buy. Use this or tokenId."),
        amountUsd: z.number().positive().max(50000).describe("Amount to spend in US dollars, paid in USDG."),
        slippageBps,
    }),
) {}

export class SellParameters extends createToolParameters(
    z.object({
        tokenId: z.string().optional().describe("Opaque token id from trnch_get_heat. Use this or token."),
        token: z.string().optional().describe("Token contract address to sell. Use this or tokenId."),
        percent: z.number().positive().max(100).describe("Share of the wallet balance to sell, 100 = all."),
        slippageBps,
    }),
) {}
