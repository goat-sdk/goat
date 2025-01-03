import { createTool } from "@goat-sdk/core";
import type { EVMWalletClient } from "@goat-sdk/wallet-evm";
import type { z } from "zod";
import {
  getCryptocurrencyListings,
  getCryptocurrencyQuotesLatest,
  getExchangeListings,
  getExchangeQuotesLatest,
  getLatestContent,
} from "./api";
import {
  cryptocurrencyListingsParametersSchema,
  cryptocurrencyQuotesLatestParametersSchema,
  exchangeListingsParametersSchema,
  exchangeQuotesLatestParametersSchema,
  contentLatestParametersSchema,
} from "./parameters";
import type { CoinmarketcapOptions } from "./index";

import { type ToolBase } from "@goat-sdk/core";

export function getTools(_walletClient: EVMWalletClient, options: CoinmarketcapOptions): ToolBase[] {
  return [
    // Cryptocurrency Tools
    createTool(
      {
        name: "coinmarketcap_cryptocurrency_listings_latest",
        description: "Fetch the latest cryptocurrency listings with market data including price, market cap, volume, and other key metrics",
        parameters: cryptocurrencyListingsParametersSchema,
      },
      async (args: z.infer<typeof cryptocurrencyListingsParametersSchema>) => {
        return getCryptocurrencyListings({
          ...args,
          apiKey: options.apiKey,
        });
      }
    ),
    createTool(
      {
        name: "coinmarketcap_cryptocurrency_quotes_latest",
        description: "Get the latest market quotes for one or more cryptocurrencies, including price, market cap, and volume in any supported currency",
        parameters: cryptocurrencyQuotesLatestParametersSchema,
      },
      async (args: z.infer<typeof cryptocurrencyQuotesLatestParametersSchema>) => {
        return getCryptocurrencyQuotesLatest({
          ...args,
          apiKey: options.apiKey,
        });
      }
    ),

    // Exchange Tools
    createTool(
      {
        name: "coinmarketcap_exchange_listings_latest",
        description: "Fetch the latest cryptocurrency exchange listings with market data including trading volume, number of markets, and liquidity metrics",
        parameters: exchangeListingsParametersSchema,
      },
      async (args: z.infer<typeof exchangeListingsParametersSchema>) => {
        return getExchangeListings({
          ...args,
          apiKey: options.apiKey,
        });
      }
    ),
    createTool(
      {
        name: "coinmarketcap_exchange_quotes_latest",
        description: "Get the latest market data for one or more exchanges including trading volume, number of markets, and other exchange-specific metrics",
        parameters: exchangeQuotesLatestParametersSchema,
      },
      async (args: z.infer<typeof exchangeQuotesLatestParametersSchema>) => {
        return getExchangeQuotesLatest({
          ...args,
          apiKey: options.apiKey,
        });
      }
    ),

    // Content Tools
    createTool(
      {
        name: "coinmarketcap_content_latest",
        description: "Fetch the latest cryptocurrency news, articles, and market analysis content from trusted sources",
        parameters: contentLatestParametersSchema,
      },
      async (args: z.infer<typeof contentLatestParametersSchema>) => {
        return getLatestContent({
          ...args,
          apiKey: options.apiKey,
        });
      }
    ),
  ];
}
