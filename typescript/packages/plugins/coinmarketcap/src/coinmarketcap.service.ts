import { Tool } from "@goat-sdk/core";
import {
  getCryptocurrencyListings,
  getCryptocurrencyQuotesLatest,
  getExchangeListings,
  getExchangeQuotesLatest,
  getLatestContent,
} from "./api";
import {
  CryptocurrencyListingsParameters,
  CryptocurrencyQuotesLatestParameters,
  ExchangeListingsParameters,
  ExchangeQuotesLatestParameters,
  ContentLatestParameters,
} from "./parameters";
import type { CoinmarketcapOptions } from "./index";

export class CoinmarketcapService {
  constructor(private readonly options: CoinmarketcapOptions) {}

  @Tool({
    name: "coinmarketcap_cryptocurrency_listings_latest",
    description: "Fetch the latest cryptocurrency listings with market data including price, market cap, volume, and other key metrics",
  })
  async getCryptocurrencyListings(
    parameters: CryptocurrencyListingsParameters
  ) {
    return getCryptocurrencyListings({
      ...parameters,
      apiKey: this.options.apiKey,
    });
  }

  @Tool({
    name: "coinmarketcap_cryptocurrency_quotes_latest",
    description: "Get the latest market quotes for one or more cryptocurrencies, including price, market cap, and volume in any supported currency",
  })
  async getCryptocurrencyQuotes(
    parameters: CryptocurrencyQuotesLatestParameters
  ) {
    return getCryptocurrencyQuotesLatest({
      ...parameters,
      apiKey: this.options.apiKey,
    });
  }

  @Tool({
    name: "coinmarketcap_exchange_listings_latest",
    description: "Fetch the latest cryptocurrency exchange listings with market data including trading volume, number of markets, and liquidity metrics",
  })
  async getExchangeListings(
    parameters: ExchangeListingsParameters
  ) {
    return getExchangeListings({
      ...parameters,
      apiKey: this.options.apiKey,
    });
  }

  @Tool({
    name: "coinmarketcap_exchange_quotes_latest",
    description: "Get the latest market data for one or more exchanges including trading volume, number of markets, and other exchange-specific metrics",
  })
  async getExchangeQuotes(
    parameters: ExchangeQuotesLatestParameters
  ) {
    return getExchangeQuotesLatest({
      ...parameters,
      apiKey: this.options.apiKey,
    });
  }

  @Tool({
    name: "coinmarketcap_content_latest",
    description: "Fetch the latest cryptocurrency news, articles, and market analysis content from trusted sources",
  })
  async getContent(
    parameters: ContentLatestParameters
  ) {
    return getLatestContent({
      ...parameters,
      apiKey: this.options.apiKey,
    });
  }
}
