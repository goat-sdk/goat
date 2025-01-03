import { Tool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import {
    type ApiResponse,
    getCryptocurrencyListings,
    getCryptocurrencyQuotesLatest,
    getExchangeListings,
    getExchangeQuotesLatest,
    getLatestContent,
} from "./api";
import type { CoinmarketcapOptions } from "./index";
import {
    ContentLatestParameters,
    CryptocurrencyListingsParameters,
    CryptocurrencyQuotesLatestParameters,
    ExchangeListingsParameters,
    ExchangeQuotesLatestParameters,
} from "./parameters";

export class CoinmarketcapService {
    constructor(private readonly options: CoinmarketcapOptions) {}

    @Tool({
        name: "coinmarketcap_cryptocurrency_listings_latest",
        description:
            "Fetch the latest cryptocurrency listings with market data including price, market cap, volume, and other key metrics",
    })
    async getCryptocurrencyListings(
        _walletClient: EVMWalletClient,
        parameters: CryptocurrencyListingsParameters,
    ): Promise<ApiResponse<Record<string, unknown>>> {
        try {
            return await getCryptocurrencyListings({
                ...parameters,
                apiKey: this.options.apiKey,
            });
        } catch (error) {
            throw new Error(`Failed to fetch cryptocurrency listings: ${error}`);
        }
    }

    @Tool({
        name: "coinmarketcap_cryptocurrency_quotes_latest",
        description:
            "Get the latest market quotes for one or more cryptocurrencies, including price, market cap, and volume in any supported currency",
    })
    async getCryptocurrencyQuotes(
        _walletClient: EVMWalletClient,
        parameters: CryptocurrencyQuotesLatestParameters,
    ): Promise<ApiResponse<Record<string, unknown>>> {
        try {
            return await getCryptocurrencyQuotesLatest({
                ...parameters,
                apiKey: this.options.apiKey,
            });
        } catch (error) {
            throw new Error(`Failed to fetch cryptocurrency quotes: ${error}`);
        }
    }

    @Tool({
        name: "coinmarketcap_exchange_listings_latest",
        description:
            "Fetch the latest cryptocurrency exchange listings with market data including trading volume, number of markets, and liquidity metrics",
    })
    async getExchangeListings(
        _walletClient: EVMWalletClient,
        parameters: ExchangeListingsParameters,
    ): Promise<ApiResponse<Record<string, unknown>>> {
        try {
            return await getExchangeListings({
                ...parameters,
                apiKey: this.options.apiKey,
            });
        } catch (error) {
            throw new Error(`Failed to fetch exchange listings: ${error}`);
        }
    }

    @Tool({
        name: "coinmarketcap_exchange_quotes_latest",
        description:
            "Get the latest market data for one or more exchanges including trading volume, number of markets, and other exchange-specific metrics",
    })
    async getExchangeQuotes(
        _walletClient: EVMWalletClient,
        parameters: ExchangeQuotesLatestParameters,
    ): Promise<ApiResponse<Record<string, unknown>>> {
        try {
            return await getExchangeQuotesLatest({
                ...parameters,
                apiKey: this.options.apiKey,
            });
        } catch (error) {
            throw new Error(`Failed to fetch exchange quotes: ${error}`);
        }
    }

    @Tool({
        name: "coinmarketcap_content_latest",
        description: "Fetch the latest cryptocurrency news, articles, and market analysis content from trusted sources",
    })
    async getContent(
        _walletClient: EVMWalletClient,
        parameters: ContentLatestParameters,
    ): Promise<ApiResponse<Record<string, unknown>>> {
        try {
            return await getLatestContent({
                ...parameters,
                apiKey: this.options.apiKey,
            });
        } catch (error) {
            throw new Error(`Failed to fetch content: ${error}`);
        }
    }
}
