import { Tool } from "@goat-sdk/core";
import {
    GetCoinDataParameters,
    GetCoinPriceByContractAddressParameters,
    GetCoinPriceParameters,
    GetHistoricalDataParameters,
    GetOHLCParameters,
    GetSupportedCoinsParameters,
    GetTrendingCoinsParameters,
    SearchCoinsParameters,
} from "./parameters";
import { COINGECKO_API_BASE_URL, buildUrl, coingeckoRequest } from "./request";

export class CoinGeckoService {
    constructor(private readonly apiKey: string) {}

    @Tool({
        description: "Get the list of trending coins from CoinGecko",
    })
    async getTrendingCoins(parameters: GetTrendingCoinsParameters) {
        return coingeckoRequest(buildUrl(`${COINGECKO_API_BASE_URL}/search/trending`, {}), this.apiKey);
    }

    @Tool({
        description: "Get the price of a specific coin from CoinGecko",
    })
    async getCoinPrice(parameters: GetCoinPriceParameters) {
        const { coinId, vsCurrency, includeMarketCap, include24hrVol, include24hrChange, includeLastUpdatedAt } =
            parameters;
        return coingeckoRequest(
            buildUrl(`${COINGECKO_API_BASE_URL}/simple/price`, {
                ids: coinId,
                vs_currencies: vsCurrency,
                include_market_cap: includeMarketCap,
                include_24hr_vol: include24hrVol,
                include_24hr_change: include24hrChange,
                include_last_updated_at: includeLastUpdatedAt,
            }),
            this.apiKey,
        );
    }

    @Tool({
        description: "Search for coins by keyword",
    })
    async searchCoins(parameters: SearchCoinsParameters) {
        const { query } = parameters;
        return coingeckoRequest(
            buildUrl(`${COINGECKO_API_BASE_URL}/search`, {
                query,
            }),
            this.apiKey,
        );
    }

    @Tool({
        description: "Get coin price by contract address",
    })
    async getCoinPriceByContractAddress(parameters: GetCoinPriceByContractAddressParameters) {
        const {
            id,
            contractAddresses,
            vsCurrency,
            includeMarketCap,
            include24hrVol,
            include24hrChange,
            includeLastUpdatedAt,
        } = parameters;

        return coingeckoRequest(
            buildUrl(`${COINGECKO_API_BASE_URL}/simple/token_price/${id}`, {
                contract_addresses: contractAddresses.join(","),
                vs_currencies: vsCurrency,
                include_market_cap: includeMarketCap,
                include_24hr_vol: include24hrVol,
                include_24hr_change: include24hrChange,
                include_last_updated_at: includeLastUpdatedAt,
            }),
            this.apiKey,
        );
    }

    @Tool({
        description: "Get detailed coin data by ID (including market data, community data, developer stats, and more)",
    })
    async getCoinData(parameters: GetCoinDataParameters) {
        const { id, localization, tickers, marketData, communityData, developerData, sparkline } = parameters;

        return coingeckoRequest(
            buildUrl(`${COINGECKO_API_BASE_URL}/coins/${id}`, {
                localization,
                tickers,
                market_data: marketData,
                community_data: communityData,
                developer_data: developerData,
                sparkline,
            }),
            this.apiKey,
        );
    }

    @Tool({
        description: "Get list of all supported coins",
    })
    async getSupportedCoins(parameters: GetSupportedCoinsParameters) {
        const { includePlatform } = parameters;
        return coingeckoRequest(
            buildUrl(`${COINGECKO_API_BASE_URL}/coins/list`, {
                include_platform: includePlatform,
            }),
            this.apiKey,
        );
    }

    @Tool({
        description: "Get historical data for a coin by ID",
    })
    async getHistoricalData(parameters: GetHistoricalDataParameters) {
        const { id, date, localization } = parameters;
        return coingeckoRequest(
            buildUrl(`${COINGECKO_API_BASE_URL}/coins/${id}/history`, {
                date,
                localization,
            }),
            this.apiKey,
        );
    }

    @Tool({
        description: "Get OHLC chart data for a coin by ID",
    })
    async getOHLCData(parameters: GetOHLCParameters) {
        const { id, vsCurrency, days } = parameters;
        return coingeckoRequest(
            buildUrl(`${COINGECKO_API_BASE_URL}/coins/${id}/ohlc`, {
                vs_currency: vsCurrency,
                days,
            }),
            this.apiKey,
        );
    }
}
