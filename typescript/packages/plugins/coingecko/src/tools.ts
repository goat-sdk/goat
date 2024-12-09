import type { DeferredTool, WalletClient } from "@goat-sdk/core";
import type { z } from "zod";

import { getCoinPriceParametersSchema, getTrendingCoinsParametersSchema } from "./parameters";

// Define methods to interact with CoinGecko API
async function fetchTrendingCoins(apiKey: string) {
    const response = await fetch(`https://api.coingecko.com/api/v3/search/trending?x_cg_demo_api_key=${apiKey}`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
}

async function fetchCoinPrice(
    coinId: string,
    vsCurrency: string,
    apiKey: string,
    options: {
        includeMarketCap: boolean;
        include24hrVol: boolean;
        include24hrChange: boolean;
        includeLastUpdatedAt: boolean;
    },
) {
    const params = new URLSearchParams({
        ids: coinId,
        vs_currencies: vsCurrency,
        include_market_cap: options.includeMarketCap.toString(),
        include_24hr_vol: options.include24hrVol.toString(),
        include_24hr_change: options.include24hrChange.toString(),
        include_last_updated_at: options.includeLastUpdatedAt.toString(),
    });
    const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?${params.toString()}&x_cg_demo_api_key=${apiKey}`,
    );
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
}

export function getTools(credentials: {
    apiKey: string;
}): DeferredTool<WalletClient>[] {
    const tools: DeferredTool<WalletClient>[] = [];

    const getTrendingCoinsTool: DeferredTool<WalletClient> = {
        name: "get_trending_coins",
        description: "This {{tool}} fetches the list of trending coins from CoinGecko",
        parameters: getTrendingCoinsParametersSchema,
        method: async () => fetchTrendingCoins(credentials.apiKey),
    };

    const getCoinPriceTool: DeferredTool<WalletClient> = {
        name: "get_coin_price",
        description: "This {{tool}} fetches the price of a specific coin from CoinGecko",
        parameters: getCoinPriceParametersSchema,
        method: async (_client: WalletClient, parameters: z.infer<typeof getCoinPriceParametersSchema>) =>
            fetchCoinPrice(parameters.coinId, parameters.vsCurrency, credentials.apiKey, {
                includeMarketCap: parameters.includeMarketCap,
                include24hrVol: parameters.include24hrVol,
                include24hrChange: parameters.include24hrChange,
                includeLastUpdatedAt: parameters.includeLastUpdatedAt,
            }),
    };

    tools.push(getTrendingCoinsTool, getCoinPriceTool);

    return tools;
}
