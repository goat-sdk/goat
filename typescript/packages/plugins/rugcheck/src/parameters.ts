import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

// Parameters for token report summary
export class GetTokenReportParameters extends createToolParameters(
    z.object({
        mint: z.string().describe("The token mint address to generate the report for"),
    }),
) {}

// Parameters for trending tokens (optional filters)
export class GetTrendingTokensParameters extends createToolParameters(
    z.object({
        limit: z.number().optional().describe("Maximum number of tokens to return"),
        offset: z.number().optional().describe("Number of tokens to skip"),
    }),
) {}

// Parameters for most voted tokens (optional filters)
export class GetMostVotedTokensParameters extends createToolParameters(
    z.object({
        limit: z.number().optional().describe("Maximum number of tokens to return"),
        offset: z.number().optional().describe("Number of tokens to skip"),
    }),
) {}

// Parameters for recently verified tokens (optional filters)
export class GetRecentlyVerifiedTokensParameters extends createToolParameters(
    z.object({
        limit: z.number().optional().describe("Maximum number of tokens to return"),
        offset: z.number().optional().describe("Number of tokens to skip"),
    }),
) {}

// Parameters for recently detected tokens (optional filters)
export class GetRecentlyDetectedTokensParameters extends createToolParameters(
    z.object({
        limit: z.number().optional().describe("Maximum number of tokens to return"),
        offset: z.number().optional().describe("Number of tokens to skip"),
    }),
) {}
