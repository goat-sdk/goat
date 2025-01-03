import type {
  cryptocurrencyListingsParametersSchema,
  cryptocurrencyQuotesLatestParametersSchema,
  exchangeListingsParametersSchema,
  exchangeQuotesLatestParametersSchema,
  contentLatestParametersSchema,
} from "./parameters";
import type { z } from "zod";

const BASE_URL = "https://pro-api.coinmarketcap.com/v1";

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

async function makeRequest<T>(
  endpoint: string,
  params: WithApiKey<T>,
): Promise<ApiResponse<Record<string, unknown>>> {
  const { apiKey, ...queryParams } = params;
  const queryString = new URLSearchParams(
    Object.entries(queryParams).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>)
  ).toString();

  const url = `${BASE_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-CMC_PRO_API_KEY': apiKey,
        'Accept': 'application/json',
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
    throw new Error('An unknown error occurred while fetching data');
  }
}

// Cryptocurrency endpoints
export async function getCryptocurrencyListings(
  params: WithApiKey<z.infer<typeof cryptocurrencyListingsParametersSchema>>,
): Promise<ApiResponse<Record<string, unknown>>> {
  return makeRequest("/cryptocurrency/listings/latest", params);
}

export async function getCryptocurrencyQuotesLatest(
  params: WithApiKey<z.infer<typeof cryptocurrencyQuotesLatestParametersSchema>>,
): Promise<ApiResponse<Record<string, unknown>>> {
  return makeRequest("/cryptocurrency/quotes/latest", params);
}

// Exchange endpoints
export async function getExchangeListings(
  params: WithApiKey<z.infer<typeof exchangeListingsParametersSchema>>,
): Promise<ApiResponse<Record<string, unknown>>> {
  return makeRequest("/exchange/listings/latest", params);
}

export async function getExchangeQuotesLatest(
  params: WithApiKey<z.infer<typeof exchangeQuotesLatestParametersSchema>>,
): Promise<ApiResponse<Record<string, unknown>>> {
  return makeRequest("/exchange/quotes/latest", params);
}

// Content endpoints
export async function getLatestContent(
  params: WithApiKey<z.infer<typeof contentLatestParametersSchema>>,
): Promise<ApiResponse<Record<string, unknown>>> {
  return makeRequest("/content/latest", params);
}
