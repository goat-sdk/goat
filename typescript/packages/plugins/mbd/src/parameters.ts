import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

export class GetPersonalizedFeedParameters extends createToolParameters(
    z.object({
        fid: z.string().describe("Farcaster user ID"),
        scoring: z
            .enum(["30min", "reply", "like", "engagement"])
            .default("engagement")
            .describe("Scoring method to use"),
        limit: z.number().min(1).max(100).default(20).describe("Number of results to return"),
    }),
) {}

export class GetSimilarCastsParameters extends createToolParameters(
    z.object({
        castId: z.string().describe("Hash of the cast to find similar content for"),
        limit: z.number().min(1).max(50).default(10).describe("Number of similar casts to return"),
    }),
) {}

export class GetTrendingFeedParameters extends createToolParameters(
    z.object({
        scoring: z.enum(["30min", "24h", "7d"]).default("30min").describe("Time window for trending content"),
        limit: z.number().min(1).max(100).default(20).describe("Number of results to return"),
    }),
) {}

export class GetContentRecommendationsParameters extends createToolParameters(
    z.object({
        fid: z.string().describe("Farcaster user ID"),
        contentType: z
            .enum(["post", "thread", "article", "idea"])
            .default("post")
            .describe("Type of content to generate"),
    }),
) {}

export class GetUserInterestsParameters extends createToolParameters(
    z.object({
        fid: z.string().describe("Farcaster user ID"),
    }),
) {}

export class GetSimilarUsersParameters extends createToolParameters(
    z.object({
        fid: z.string().describe("Farcaster user ID"),
        limit: z.number().min(1).max(50).default(10).describe("Number of similar users to return"),
    }),
) {}

export class GetTrendAnalysisParameters extends createToolParameters(
    z.object({
        fid: z.string().describe("Farcaster user ID"),
        timeframe: z.enum(["24h", "7d", "30d"]).default("7d").describe("Timeframe for trend analysis"),
    }),
) {}
