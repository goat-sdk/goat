import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

// Parameters for token report summary
export const TokenReportSchema = z.object({
    mint: z.string().describe("The token mint address to generate the report for"),
});
export type TokenReportType = z.infer<typeof TokenReportSchema>;
export class GetTokenReportParameters extends createToolParameters<typeof TokenReportSchema>(TokenReportSchema) {}

// Parameters for trending tokens (optional filters)
export const TrendingTokensSchema = z.object({
    limit: z.number().optional().describe("Maximum number of tokens to return"),
    offset: z.number().optional().describe("Number of tokens to skip"),
});
export type TrendingTokensType = z.infer<typeof TrendingTokensSchema>;
export class GetTrendingTokensParameters extends createToolParameters<typeof TrendingTokensSchema>(
    TrendingTokensSchema,
) {}

// Parameters for most voted tokens (optional filters)
export const MostVotedTokensSchema = z.object({
    limit: z.number().optional().describe("Maximum number of tokens to return"),
    offset: z.number().optional().describe("Number of tokens to skip"),
});
export type MostVotedTokensType = z.infer<typeof MostVotedTokensSchema>;
export class GetMostVotedTokensParameters extends createToolParameters<typeof MostVotedTokensSchema>(
    MostVotedTokensSchema,
) {}

// Parameters for recently verified tokens (optional filters)
export const RecentlyVerifiedTokensSchema = z.object({
    limit: z.number().optional().describe("Maximum number of tokens to return"),
    offset: z.number().optional().describe("Number of tokens to skip"),
});
export type RecentlyVerifiedTokensType = z.infer<typeof RecentlyVerifiedTokensSchema>;
export class GetRecentlyVerifiedTokensParameters extends createToolParameters<typeof RecentlyVerifiedTokensSchema>(
    RecentlyVerifiedTokensSchema,
) {}

// Parameters for recently detected tokens (optional filters)
export const RecentlyDetectedTokensSchema = z.object({
    limit: z.number().optional().describe("Maximum number of tokens to return"),
    offset: z.number().optional().describe("Number of tokens to skip"),
});
export type RecentlyDetectedTokensType = z.infer<typeof RecentlyDetectedTokensSchema>;
export class GetRecentlyDetectedTokensParameters extends createToolParameters<typeof RecentlyDetectedTokensSchema>(
    RecentlyDetectedTokensSchema,
) {}
