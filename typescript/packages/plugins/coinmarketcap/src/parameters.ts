import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

export class CryptocurrencyListingsParameters extends createToolParameters(
    z.object({
        start: z.number().optional().describe("Starting position of results"),
        limit: z.number().optional().describe("Number of results to return"),
        sort: z.string().optional().describe("What field to sort the list by"),
        sort_dir: z.enum(["asc", "desc"]).optional().describe("Direction to sort the list"),
        cryptocurrency_type: z
            .enum(["all", "coins", "tokens"])
            .optional()
            .describe("Type of cryptocurrency to include"),
        tag: z.string().optional().describe("Tag to filter by"),
        aux: z.string().optional().describe("Comma-separated list of auxiliary fields to return"),
        convert: z.string().optional().describe("Currency to convert prices to"),
    }),
) {}

export class CryptocurrencyQuotesLatestParameters extends createToolParameters(
    z.object({
        id: z.string().optional().describe("One or more comma-separated cryptocurrency IDs"),
        symbol: z.string().optional().describe("One or more comma-separated cryptocurrency symbols"),
        convert: z.string().optional().describe("Currency to convert prices to"),
        aux: z.string().optional().describe("Comma-separated list of auxiliary fields to return"),
    }),
) {}

export class ExchangeListingsParameters extends createToolParameters(
    z.object({
        start: z.number().optional().describe("Starting position of results"),
        limit: z.number().optional().describe("Number of results to return"),
        sort: z.string().optional().describe("What field to sort the list by"),
        sort_dir: z.enum(["asc", "desc"]).optional().describe("Direction to sort the list"),
        market_type: z.enum(["all", "spot", "derivatives"]).optional().describe("Type of exchange market"),
        aux: z.string().optional().describe("Comma-separated list of auxiliary fields to return"),
        convert: z.string().optional().describe("Currency to convert prices to"),
    }),
) {}

export class ExchangeQuotesLatestParameters extends createToolParameters(
    z.object({
        id: z.string().optional().describe("One or more comma-separated exchange IDs"),
        slug: z.string().optional().describe("One or more comma-separated exchange slugs"),
        convert: z.string().optional().describe("Currency to convert prices to"),
        aux: z.string().optional().describe("Comma-separated list of auxiliary fields to return"),
    }),
) {}

export class ContentLatestParameters extends createToolParameters(
    z.object({
        start: z.number().optional().describe("Starting position of results"),
        limit: z.number().optional().describe("Number of results to return"),
        content_type: z.enum(["all", "news", "headlines", "articles"]).optional().describe("Type of content to return"),
        sort: z.enum(["latest", "popular"]).optional().describe("Sort content by latest or popularity"),
        news_type: z.enum(["all", "trending", "latest"]).optional().describe("Type of news content to return"),
        start_time: z.string().optional().describe("Timestamp (ISO 8601) to start returning content from"),
        end_time: z.string().optional().describe("Timestamp (ISO 8601) to end returning content at"),
    }),
) {}

export class CryptocurrencyMapParameters extends createToolParameters(
    z.object({
        listing_status: z.enum(["active", "inactive", "untracked"]).optional().describe("Status of listings to return"),
        start: z.number().optional().describe("Starting position of results"),
        limit: z.number().optional().describe("Number of results to return"),
        sort: z.enum(["cmc_rank", "id", "name"]).optional().describe("What field to sort the list by"),
        symbol: z.string().optional().describe("Cryptocurrency symbol(s) to filter by"),
        aux: z.string().optional().describe("Comma-separated list of auxiliary fields to return"),
    }),
) {}

export class CryptocurrencyOHLCVLatestParameters extends createToolParameters(
    z.object({
        id: z.string().optional().describe("One or more comma-separated cryptocurrency IDs"),
        symbol: z.string().optional().describe("One or more comma-separated cryptocurrency symbols"),
        convert: z.string().optional().describe("Currency to convert prices to"),
        convert_id: z.string().optional().describe("Currency ID to convert prices to"),
        skip_invalid: z.boolean().optional().describe("Skip invalid currency conversions"),
    }),
) {}

export class CryptocurrencyTrendingLatestParameters extends createToolParameters(
    z.object({
        start: z.number().optional().describe("Starting position of results"),
        limit: z.number().optional().describe("Number of results to return"),
        time_period: z.enum(["24h", "30d", "7d"]).optional().describe("Time period for trending data"),
        convert: z.string().optional().describe("Currency to convert prices to"),
        convert_id: z.string().optional().describe("Currency ID to convert prices to"),
    }),
) {}

export class CryptocurrencyTrendingMostVisitedParameters extends createToolParameters(
    z.object({
        start: z.number().optional().describe("Starting position of results"),
        limit: z.number().optional().describe("Number of results to return"),
        time_period: z.enum(["24h", "30d", "7d"]).optional().describe("Time period for trending data"),
        convert: z.string().optional().describe("Currency to convert prices to"),
        convert_id: z.string().optional().describe("Currency ID to convert prices to"),
    }),
) {}

export class CryptocurrencyTrendingGainersLosersParameters extends createToolParameters(
    z.object({
        start: z.number().optional().describe("Starting position of results"),
        limit: z.number().optional().describe("Number of results to return"),
        time_period: z.enum(["1h", "24h", "7d", "30d"]).optional().describe("Time period for trending data"),
        convert: z.string().optional().describe("Currency to convert prices to"),
        convert_id: z.string().optional().describe("Currency ID to convert prices to"),
        sort: z.string().optional().describe("What field to sort the list by"),
        sort_dir: z.enum(["asc", "desc"]).optional().describe("Direction to sort the list"),
    }),
) {}
