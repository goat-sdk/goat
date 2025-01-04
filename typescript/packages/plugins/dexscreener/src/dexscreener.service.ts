import { Tool } from "@goat-sdk/core";
import { GetPairsByChainAndPairParameters, GetTokenPairsParameters, SearchPairsParameters } from "./parameters";
import { DexscreenerPairResponse } from "./types";

export class DexscreenerService {
    private readonly baseUrl = "https://api.dexscreener.com/latest";
    private readonly rateLimit = {
        pairs: 300, // requests per minute
        profiles: 60, // requests per minute
    };

    private lastRequestTime = 0;
    private requestCount = 0;

    private async enforceRateLimit() {
        const now = Date.now();
        const oneMinute = 60 * 1000;

        // Reset counter if a minute has passed
        if (now - this.lastRequestTime >= oneMinute) {
            this.requestCount = 0;
            this.lastRequestTime = now;
            return;
        }

        // If we're under the limit, just increment
        if (this.requestCount < this.rateLimit.pairs) {
            this.requestCount++;
            return;
        }

        // Wait until the minute is up
        const timeToWait = oneMinute - (now - this.lastRequestTime);
        await new Promise((resolve) => setTimeout(resolve, timeToWait));
        this.requestCount = 1;
        this.lastRequestTime = Date.now();
    }

    @Tool({
        name: "dexscreener.get_pairs_by_chain_and_pair",
        description: "Fetch pairs by chainId and pairId from Dexscreener",
    })
    async getPairsByChainAndPair(parameters: GetPairsByChainAndPairParameters) {
        try {
            await this.enforceRateLimit();
            const url = `${this.baseUrl}/pairs/${parameters.chainId}/${parameters.pairId}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = (await response.json()) as DexscreenerPairResponse;
            return data;
        } catch (error) {
            throw new Error(`Failed to fetch pairs: ${error}`);
        }
    }

    @Tool({
        name: "dexscreener.search_pairs",
        description: "Search for DEX pairs matching a query string on Dexscreener",
    })
    async searchPairs(parameters: SearchPairsParameters) {
        try {
            await this.enforceRateLimit();
            const url = `${this.baseUrl}/search?q=${encodeURIComponent(parameters.query)}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = (await response.json()) as DexscreenerPairResponse;
            return data;
        } catch (error) {
            throw new Error(`Failed to search pairs: ${error}`);
        }
    }

    @Tool({
        name: "dexscreener.get_token_pairs",
        description: "Get all DEX pairs for given token addresses (up to 30) from Dexscreener",
    })
    async getTokenPairs(parameters: GetTokenPairsParameters) {
        try {
            await this.enforceRateLimit();
            if (parameters.tokenAddresses.length > 30) {
                throw new Error("Maximum of 30 token addresses allowed per request");
            }
            const addresses = parameters.tokenAddresses.join(",");
            const url = `${this.baseUrl}/tokens/${addresses}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = (await response.json()) as DexscreenerPairResponse;
            return data;
        } catch (error) {
            throw new Error(`Failed to get token pairs: ${error}`);
        }
    }
}
