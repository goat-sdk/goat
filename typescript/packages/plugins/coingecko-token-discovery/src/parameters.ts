import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

export class GetTokenInfoByTickerParameters extends createToolParameters(
    z.object({
        ticker: z.string().describe("The ticker symbol of the token to look up (e.g., 'BTC', 'ETH', 'USDC')"),
    }),
) {}

export class GetTokenInfoBySymbolParameters extends createToolParameters(
    z.object({
        symbol: z.string().describe("The symbol of the token to look up (e.g., 'BTC', 'ETH', 'USDC')"),
    }),
) {}
