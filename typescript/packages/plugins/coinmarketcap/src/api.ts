import type { z } from "zod";
import type {
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

const BASE_URL =
    process.env.NODE_ENV === "test"
        ? "https://sandbox-api.coinmarketcap.com/v1"
        : "https://pro-api.coinmarketcap.com/v1";

export interface ApiResponse<T> {
    data: T;
    status: {
        timestamp: string;
        error_code: number;
        error_message: string | null;
        elapsed: number;
        credit_count: number;
    };
}

type WithApiKey<T> = T & { apiKey: string };

async function makeRequest<T>(endpoint: string, params: WithApiKey<T>): Promise<ApiResponse<Record<string, unknown>>> {
    const { apiKey, ...queryParams } = params;
    const queryString = new URLSearchParams(
        Object.entries(queryParams).reduce(
            (acc, [key, value]) => {
                if (value !== undefined) {
                    acc[key] = String(value);
                }
                return acc;
            },
            {} as Record<string, string>,
        ),
    ).toString();

    const url = `${BASE_URL}${endpoint}${queryString ? `?${queryString}` : ""}`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "X-CMC_PRO_API_KEY": apiKey,
                Accept: "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
                `CoinMarketCap API Error: ${response.status} - ${
                    errorData?.status?.error_message || response.statusText
                }`,
            );
        }

        return response.json();
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("An unknown error occurred while fetching data");
    }
}

// Cryptocurrency endpoints
export async function getCryptocurrencyListings(
    params: WithApiKey<z.infer<(typeof CryptocurrencyListingsParameters)["schema"]>>,
): Promise<ApiResponse<Record<string, unknown>>> {
    return makeRequest("/cryptocurrency/listings/latest", params);
}

export async function getCryptocurrencyQuotesLatest(
    params: WithApiKey<z.infer<(typeof CryptocurrencyQuotesLatestParameters)["schema"]>>,
): Promise<ApiResponse<Record<string, unknown>>> {
    return makeRequest("/cryptocurrency/quotes/latest", params);
}

// Exchange endpoints
export async function getExchangeListings(
    params: WithApiKey<z.infer<(typeof ExchangeListingsParameters)["schema"]>>,
): Promise<ApiResponse<Record<string, unknown>>> {
    return makeRequest("/exchange/listings/latest", params);
}

export async function getExchangeQuotesLatest(
    params: WithApiKey<z.infer<(typeof ExchangeQuotesLatestParameters)["schema"]>>,
): Promise<ApiResponse<Record<string, unknown>>> {
    return makeRequest("/exchange/quotes/latest", params);
}

// Content endpoints
export async function getLatestContent(
    params: WithApiKey<z.infer<(typeof ContentLatestParameters)["schema"]>>,
): Promise<ApiResponse<Record<string, unknown>>> {
    return makeRequest("/content/latest", params);
}

// Additional cryptocurrency endpoints
export async function getCryptocurrencyMap(
    params: WithApiKey<z.infer<(typeof CryptocurrencyMapParameters)["schema"]>>,
): Promise<ApiResponse<Record<string, unknown>>> {
    return makeRequest("/cryptocurrency/map", params);
}

export async function getCryptocurrencyOHLCVLatest(
    params: WithApiKey<z.infer<(typeof CryptocurrencyOHLCVLatestParameters)["schema"]>>,
): Promise<ApiResponse<Record<string, unknown>>> {
    return makeRequest("/v2/cryptocurrency/ohlcv/latest", params);
}

export async function getCryptocurrencyTrendingLatest(
    params: WithApiKey<z.infer<(typeof CryptocurrencyTrendingLatestParameters)["schema"]>>,
): Promise<ApiResponse<Record<string, unknown>>> {
    return makeRequest("/cryptocurrency/trending/latest", params);
}

export async function getCryptocurrencyTrendingMostVisited(
    params: WithApiKey<z.infer<(typeof CryptocurrencyTrendingMostVisitedParameters)["schema"]>>,
): Promise<ApiResponse<Record<string, unknown>>> {
    return makeRequest("/cryptocurrency/trending/most-visited", params);
}

export async function getCryptocurrencyTrendingGainersLosers(
    params: WithApiKey<z.infer<(typeof CryptocurrencyTrendingGainersLosersParameters)["schema"]>>,
): Promise<ApiResponse<Record<string, unknown>>> {
    return makeRequest("/cryptocurrency/trending/gainers-losers", params);
}
