import { Tool } from "@goat-sdk/core";
import { RugCheckApi } from "./api";
import {
    GetMostVotedTokensParameters,
    GetRecentlyDetectedTokensParameters,
    GetRecentlyVerifiedTokensParameters,
    GetTokenReportParameters,
    GetTrendingTokensParameters,
} from "./parameters";

export class RugCheckService {
    constructor(private readonly api: RugCheckApi) {}

    @Tool({
        name: "rugcheck.get_recently_detected_tokens",
        description: "Get recently detected tokens from RugCheck",
    })
    async getRecentlyDetectedTokens(params: GetRecentlyDetectedTokensParameters) {
        const queryParams = new URLSearchParams();
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.offset) queryParams.append("offset", params.offset.toString());
        const endpoint = `/stats/new_tokens${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
        return this.api.makeRequest(endpoint);
    }

    @Tool({
        name: "rugcheck.get_trending_tokens_24h",
        description: "Get trending tokens in the last 24h from RugCheck",
    })
    async getTrendingTokens24h(params: GetTrendingTokensParameters) {
        const queryParams = new URLSearchParams();
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.offset) queryParams.append("offset", params.offset.toString());
        const endpoint = `/stats/trending${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
        return this.api.makeRequest(endpoint);
    }

    @Tool({
        name: "rugcheck.get_most_voted_tokens_24h",
        description: "Get tokens with the most votes in the last 24h from RugCheck",
    })
    async getMostVotedTokens24h(params: GetMostVotedTokensParameters) {
        const queryParams = new URLSearchParams();
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.offset) queryParams.append("offset", params.offset.toString());
        const endpoint = `/stats/recent${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
        return this.api.makeRequest(endpoint);
    }

    @Tool({
        name: "rugcheck.get_recently_verified_tokens",
        description: "Get recently verified tokens from RugCheck",
    })
    async getRecentlyVerifiedTokens(params: GetRecentlyVerifiedTokensParameters) {
        const queryParams = new URLSearchParams();
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.offset) queryParams.append("offset", params.offset.toString());
        const endpoint = `/stats/verified${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
        return this.api.makeRequest(endpoint);
    }

    @Tool({
        name: "rugcheck.generate_token_report_summary",
        description: "Generate a report summary for the given token mint",
    })
    async generateTokenReportSummary(params: GetTokenReportParameters) {
        return this.api.makeRequest(`/tokens/${params.mint}/report/summary`);
    }
}
