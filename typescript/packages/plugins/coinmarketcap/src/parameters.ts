import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

// Parameter classes for Tool decorator
const CryptocurrencyListingsSchema = z.object({
  start: z.number().optional().describe("Starting position of results"),
  limit: z.number().optional().describe("Number of results to return"),
  sort: z.string().optional().describe("What field to sort the list by"),
  sort_dir: z.enum(["asc", "desc"]).optional().describe("Direction to sort the list"),
  cryptocurrency_type: z.enum(["all", "coins", "tokens"]).optional().describe("Type of cryptocurrency to include"),
  tag: z.string().optional().describe("Tag to filter by"),
  aux: z.string().optional().describe("Comma-separated list of auxiliary fields to return"),
  convert: z.string().optional().describe("Currency to convert prices to"),
});

const CryptocurrencyQuotesLatestSchema = z.object({
  id: z.string().optional().describe("One or more comma-separated cryptocurrency IDs"),
  symbol: z.string().optional().describe("One or more comma-separated cryptocurrency symbols"),
  convert: z.string().optional().describe("Currency to convert prices to"),
  aux: z.string().optional().describe("Comma-separated list of auxiliary fields to return"),
});

const ExchangeListingsSchema = z.object({
  start: z.number().optional().describe("Starting position of results"),
  limit: z.number().optional().describe("Number of results to return"),
  sort: z.string().optional().describe("What field to sort the list by"),
  sort_dir: z.enum(["asc", "desc"]).optional().describe("Direction to sort the list"),
  market_type: z.enum(["all", "spot", "derivatives"]).optional().describe("Type of exchange market"),
  aux: z.string().optional().describe("Comma-separated list of auxiliary fields to return"),
  convert: z.string().optional().describe("Currency to convert prices to"),
});

const ExchangeQuotesLatestSchema = z.object({
  id: z.string().optional().describe("One or more comma-separated exchange IDs"),
  slug: z.string().optional().describe("One or more comma-separated exchange slugs"),
  convert: z.string().optional().describe("Currency to convert prices to"),
  aux: z.string().optional().describe("Comma-separated list of auxiliary fields to return"),
});

const ContentLatestSchema = z.object({
  start: z.number().optional().describe("Starting position of results"),
  limit: z.number().optional().describe("Number of results to return"),
  content_type: z.enum(["all", "news", "headlines", "articles"]).optional().describe("Type of content to return"),
  sort: z.enum(["latest", "popular"]).optional().describe("Sort content by latest or popularity"),
  news_type: z.enum(["all", "trending", "latest"]).optional().describe("Type of news content to return"),
  start_time: z.string().optional().describe("Timestamp (ISO 8601) to start returning content from"),
  end_time: z.string().optional().describe("Timestamp (ISO 8601) to end returning content at"),
});

export class CryptocurrencyListingsParameters extends createToolParameters(CryptocurrencyListingsSchema) {
  static schema = CryptocurrencyListingsSchema;
}

export class CryptocurrencyQuotesLatestParameters extends createToolParameters(CryptocurrencyQuotesLatestSchema) {
  static schema = CryptocurrencyQuotesLatestSchema;
}

export class ExchangeListingsParameters extends createToolParameters(ExchangeListingsSchema) {
  static schema = ExchangeListingsSchema;
}

export class ExchangeQuotesLatestParameters extends createToolParameters(ExchangeQuotesLatestSchema) {
  static schema = ExchangeQuotesLatestSchema;
}

export class ContentLatestParameters extends createToolParameters(ContentLatestSchema) {
  static schema = ContentLatestSchema;
}
