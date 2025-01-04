import { Tool } from "@goat-sdk/core";
import { GetAggregatedBalancesAndAllowancesParameters } from "./parameters";
import { AggregatedBalancesAndAllowancesResponse, BalanceServiceParams } from "./types";

export class BalanceService {
    private readonly baseUrl: string;
    private readonly apiKey?: string;

    constructor(params: BalanceServiceParams = {}) {
        this.baseUrl = params.baseUrl ?? "https://api.1inch.dev/balance";
        this.apiKey = params.apiKey;
    }

    @Tool({
        description:
            "Get aggregated balances and allowances for a list of wallet addresses, checking their token balances and allowances for a specific spender address.",
    })
    async getAggregatedBalancesAndAllowances(
        parameters: GetAggregatedBalancesAndAllowancesParameters,
    ): Promise<AggregatedBalancesAndAllowancesResponse> {
        const { chain, spender, wallets, filterEmpty } = parameters;

        const url = new URL(`${this.baseUrl}/v1.2/${chain}/aggregatedBalancesAndAllowances/${spender}`);
        url.searchParams.append("wallets", wallets.join(","));
        if (filterEmpty !== undefined) {
            url.searchParams.append("filterEmpty", String(filterEmpty));
        }

        const response = await fetch(url.toString(), {
            headers: {
                Accept: "application/json",
                ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch balances: ${response.statusText}`);
        }

        return await response.json();
    }
}
