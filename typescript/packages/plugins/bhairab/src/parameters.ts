import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

export class ScanTokenParameters extends createToolParameters(
    z.object({
        token: z.string().describe("The Solana token mint address to scan for risk"),
        action: z
            .enum(["buy", "sell", "swap", "transfer"])
            .optional()
            .describe("The intended action (defaults to buy)"),
        amountUsd: z.number().optional().describe("Optional intended amount in USD, for context"),
    }),
) {}
