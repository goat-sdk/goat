import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

const market = z
    .string()
    .min(1)
    .describe("Polymarket market: a condition id (0x + 64 hex), a numeric market id, or a market slug");

export class GetSettlementRiskParameters extends createToolParameters(z.object({ market })) {}

export class GetSettlementEstimateParameters extends createToolParameters(z.object({ market })) {}

export class VerifyRecordParameters extends createToolParameters(
    z.object({
        record: z
            .string()
            .min(1)
            .describe("A Predge signed record as a JSON string: a full API response or its `attestation` envelope"),
    }),
) {}

export class GetWhaleTradesParameters extends createToolParameters(
    z.object({
        limit: z.number().int().min(1).max(100).default(20).describe("Number of trades to return (1-100)"),
    }),
) {}
