import { z } from "zod";
import { createToolParameters } from "@goat-sdk/core";

// Common parameters used across multiple endpoints
const paginationSchema = z.object({
  start: z.number().optional().describe("Starting point for data retrieval, default is 1"),
  limit: z.number().optional().describe("Number of results to return, default is 100"),
});

const convertSchema = z.object({
  convert: z.string().optional().describe("Comma-separated cryptocurrency or fiat currency symbols to convert market data into"),
});

const sortSchema = z.object({
  sort: z.string().optional().describe("What field to sort the list by"),
  sort_dir: z.enum(["asc", "desc"]).optional().describe("Direction to sort (ascending or descending)"),
});

// Cryptocurrency endpoints parameters
export const cryptocurrencyListingsParametersSchema = paginationSchema.merge(convertSchema).merge(sortSchema).extend({
  cryptocurrency_type: z.enum(["all", "coins", "tokens"]).optional()
    .describe("Type of cryptocurrency to include"),
  tag: z.string().optional()
    .describe("Filter by cryptocurrency tags (e.g., 'defi', 'filesharing')"),
  aux: z.string().optional()
    .describe("Comma-separated list of supplemental data fields: platform,tags,date_added,circulating_supply,total_supply,max_supply,cmc_rank,num_market_pairs"),
});

export const cryptocurrencyQuotesLatestParametersSchema = z.object({
  id: z.string().optional().describe("One or more comma-separated CoinMarketCap cryptocurrency IDs"),
  symbol: z.string().optional().describe("One or more comma-separated cryptocurrency symbols"),
  convert: z.string().optional().describe("Comma-separated fiat or cryptocurrency symbols to convert market data into"),
  aux: z.string().optional()
    .describe("Comma-separated list of supplemental data fields"),
});

// Exchange endpoints parameters
export const exchangeListingsParametersSchema = paginationSchema.merge(convertSchema).merge(sortSchema).extend({
  market_type: z.enum(["all", "spot", "derivatives"]).optional()
    .describe("Type of exchange markets to include"),
  aux: z.string().optional()
    .describe("Comma-separated list of supplemental data fields: num_market_pairs,traffic_score,rank,exchange_score,liquidity_score"),
});

export const exchangeQuotesLatestParametersSchema = z.object({
  id: z.string().optional().describe("One or more comma-separated CoinMarketCap exchange IDs"),
  slug: z.string().optional().describe("One or more comma-separated exchange slugs"),
  convert: z.string().optional().describe("Comma-separated fiat currency symbols to convert market data into"),
});

// Content endpoints parameters
export const contentLatestParametersSchema = paginationSchema.extend({
  content_type: z.enum(["all", "news", "headlines", "articles"]).optional()
    .describe("Type of content to return"),
  sort: z.enum(["latest", "popular"]).optional()
    .describe("Sort content by latest or popularity"),
  news_type: z.enum(["all", "trending", "latest"]).optional()
    .describe("Type of news content to return"),
  start_time: z.string().optional()
    .describe("Timestamp (ISO 8601) to start returning content from"),
  end_time: z.string().optional()
    .describe("Timestamp (ISO 8601) to end returning content at"),
});

// Parameter classes for Tool decorator
export class CryptocurrencyListingsParameters extends createToolParameters(cryptocurrencyListingsParametersSchema) {}
export class CryptocurrencyQuotesLatestParameters extends createToolParameters(cryptocurrencyQuotesLatestParametersSchema) {}
export class ExchangeListingsParameters extends createToolParameters(exchangeListingsParametersSchema) {}
export class ExchangeQuotesLatestParameters extends createToolParameters(exchangeQuotesLatestParametersSchema) {}
export class ContentLatestParameters extends createToolParameters(contentLatestParametersSchema) {}
