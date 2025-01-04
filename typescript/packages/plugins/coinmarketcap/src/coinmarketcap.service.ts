import { Tool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { z } from "zod";
import {
    getCryptocurrencyListings,
    getCryptocurrencyMap,
    getCryptocurrencyOHLCVLatest,
    getCryptocurrencyQuotesLatest,
    getCryptocurrencyTrendingGainersLosers,
    getCryptocurrencyTrendingLatest,
    getCryptocurrencyTrendingMostVisited,
    getExchangeListings,
    getExchangeQuotesLatest,
    getLatestContent,
} from "./api";
import type { CoinmarketcapOptions } from "./index";
import {
    ContentLatestParameters,
    CryptocurrencyListingsParameters,
    CryptocurrencyMapParameters,
    CryptocurrencyOHLCVLatestParameters,
    CryptocurrencyQuotesLatestParameters,
    CryptocurrencyTrendingGainersLosersParameters,
    CryptocurrencyTrendingLatestParameters,
    CryptocurrencyTrendingMostVisitedParameters,
    ExchangeListingsParameters,
    ExchangeQuotesLatestParameters,
} from "./parameters";

type ApiResponse<T> = {
    data: T;
    status: {
        timestamp: string;
        error_code: number;
        error_message: string | null;
        elapsed: number;
        credit_count: number;
    };
};

export class CoinmarketcapService {
    constructor(private readonly options: CoinmarketcapOptions) {}

    @Tool({
        description:
            "Fetch the latest cryptocurrency listings with market data including price, market cap, volume, and other key metrics",
    })
    async getCryptocurrencyListings(
        walletClient: EVMWalletClient,
        parameters: CryptocurrencyListingsParameters,
    ): Promise<ApiResponse<Record<string, unknown>>> {
        try {
            return await getCryptocurrencyListings({ ...parameters, apiKey: this.options.apiKey });
        } catch (error) {
            throw new Error(`Failed to fetch cryptocurrency listings: ${error}`);
        }
    }

    @Tool({
        description:
            "Get the latest market quotes for one or more cryptocurrencies, including price, market cap, and volume in any supported currency",
    })
    async getCryptocurrencyQuotes(
        walletClient: EVMWalletClient,
        parameters: CryptocurrencyQuotesLatestParameters,
    ): Promise<ApiResponse<Record<string, unknown>>> {
        try {
            return await getCryptocurrencyQuotesLatest({ ...parameters, apiKey: this.options.apiKey });
        } catch (error) {
            throw new Error(`Failed to fetch cryptocurrency quotes: ${error}`);
        }
    }

    @Tool({
        description:
            "Fetch the latest cryptocurrency exchange listings with market data including trading volume, number of markets, and liquidity metrics",
    })
    async getExchangeListings(
        walletClient: EVMWalletClient,
        parameters: ExchangeListingsParameters,
    ): Promise<ApiResponse<Record<string, unknown>>> {
        try {
            return await getExchangeListings({ ...parameters, apiKey: this.options.apiKey });
        } catch (error) {
            throw new Error(`Failed to fetch exchange listings: ${error}`);
        }
    }

    @Tool({
        description:
            "Get the latest market data for one or more exchanges including trading volume, number of markets, and other exchange-specific metrics",
    })
    async getExchangeQuotes(
        walletClient: EVMWalletClient,
        parameters: ExchangeQuotesLatestParameters,
    ): Promise<ApiResponse<Record<string, unknown>>> {
        try {
            return await getExchangeQuotesLatest({ ...parameters, apiKey: this.options.apiKey });
        } catch (error) {
            throw new Error(`Failed to fetch exchange quotes: ${error}`);
        }
    }

    @Tool({
        description: "Fetch the latest cryptocurrency news, articles, and market analysis content from trusted sources",
    })
    async getContent(
        walletClient: EVMWalletClient,
        parameters: ContentLatestParameters,
    ): Promise<ApiResponse<Record<string, unknown>>> {
        try {
            return await getLatestContent({ ...parameters, apiKey: this.options.apiKey });
        } catch (error) {
            throw new Error(`Failed to fetch content: ${error}`);
        }
    }

    @Tool({
        description:
            "Get a mapping of all cryptocurrencies with unique CoinMarketCap IDs, including active and inactive assets",
    })
    async getCryptocurrencyMap(
        walletClient: EVMWalletClient,
        parameters: CryptocurrencyMapParameters,
    ): Promise<ApiResponse<Record<string, unknown>>> {
        try {
            return await getCryptocurrencyMap({ ...parameters, apiKey: this.options.apiKey });
        } catch (error) {
            throw new Error(`Failed to fetch cryptocurrency map: ${error}`);
        }
    }

    @Tool({
        description: "Get the latest OHLCV (Open, High, Low, Close, Volume) values for cryptocurrencies",
    })
    async getCryptocurrencyOHLCV(
        walletClient: EVMWalletClient,
        parameters: CryptocurrencyOHLCVLatestParameters,
    ): Promise<ApiResponse<Record<string, unknown>>> {
        try {
            return await getCryptocurrencyOHLCVLatest({ ...parameters, apiKey: this.options.apiKey });
        } catch (error) {
            throw new Error(`Failed to fetch cryptocurrency OHLCV data: ${error}`);
        }
    }

    @Tool({
        description: "Get the latest trending cryptocurrencies based on CoinMarketCap user activity",
    })
    async getCryptocurrencyTrending(
        walletClient: EVMWalletClient,
        parameters: CryptocurrencyTrendingLatestParameters,
    ): Promise<ApiResponse<Record<string, unknown>>> {
        try {
            return await getCryptocurrencyTrendingLatest({ ...parameters, apiKey: this.options.apiKey });
        } catch (error) {
            throw new Error(`Failed to fetch trending cryptocurrencies: ${error}`);
        }
    }

    @Tool({
        description: "Get the most visited cryptocurrencies on CoinMarketCap over a specified time period",
    })
    async getCryptocurrencyMostVisited(
        walletClient: EVMWalletClient,
        parameters: CryptocurrencyTrendingMostVisitedParameters,
    ): Promise<ApiResponse<Record<string, unknown>>> {
        try {
            return await getCryptocurrencyTrendingMostVisited({ ...parameters, apiKey: this.options.apiKey });
        } catch (error) {
            throw new Error(`Failed to fetch most visited cryptocurrencies: ${error}`);
        }
    }

    @Tool({
        description:
            "Get the top gaining and losing cryptocurrencies based on price changes over different time periods",
    })
    async getCryptocurrencyGainersLosers(
        walletClient: EVMWalletClient,
        parameters: CryptocurrencyTrendingGainersLosersParameters,
    ): Promise<ApiResponse<Record<string, unknown>>> {
        try {
            return await getCryptocurrencyTrendingGainersLosers({ ...parameters, apiKey: this.options.apiKey });
        } catch (error) {
            throw new Error(`Failed to fetch cryptocurrency gainers and losers: ${error}`);
        }
    }
}
