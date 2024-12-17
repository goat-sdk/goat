import { Tool } from "@goat-sdk/core";
import { GetCoinPriceParameters, GetTrendingCoinsParameters } from "./parameters";

export class CoinGeckoService {
    constructor(private readonly apiKey: string) {}

    @Tool({
        description: "Get the list of trending coins from CoinGecko",
    })
    async getTrendingCoins(parameters: GetTrendingCoinsParameters) {
        const response = await fetch(
            `https://api.coingecko.com/api/v3/search/trending?x_cg_demo_api_key=${this.apiKey}`,
        );
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    @Tool({
        description: "Get the price of a specific coin from CoinGecko",
    })
    async getCoinPrice(parameters: GetCoinPriceParameters) {
        const { coinId, vsCurrency, includeMarketCap, include24hrVol, include24hrChange, includeLastUpdatedAt } =
            parameters;
        const params = new URLSearchParams({
            ids: coinId,
            vs_currencies: vsCurrency,
            include_market_cap: includeMarketCap.toString(),
            include_24hr_vol: include24hrVol.toString(),
            include_24hr_change: include24hrChange.toString(),
            include_last_updated_at: includeLastUpdatedAt.toString(),
        });
        const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?${params.toString()}&x_cg_demo_api_key=${this.apiKey}`,
        );
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }
}
