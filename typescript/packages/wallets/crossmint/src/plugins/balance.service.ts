import { CrossmintApiClient } from "@crossmint/common-sdk-base";
import { Tool, WalletClientBase, createToolParameters } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { z } from "zod";
import { SUPPORTED_CURRENCIES } from "../currencies";

export class TokenBalanceParameters extends createToolParameters(
    z.object({
        wallet: z.string().describe("The address to get balances for"),
        currencies: z.array(z.enum(SUPPORTED_CURRENCIES)).min(1).describe("The currencies to get balances for"),
        chains: z.array(z.string()).optional().describe("The specific chains to query"),
    }),
) {}

export interface TokenBalance {
    currency: string;
    decimals: number;
    balances: {
        [chain: string]: string;
        total: string;
    };
}

export interface GetWalletBalanceResponse {
    balances: TokenBalance[];
}

export class TokenBalanceService {
    constructor(private readonly client: CrossmintApiClient) {}

    @Tool({
        description: "Get the token balances of the current wallet",
    })
    async getBalance(walletClient: WalletClientBase, parameters: TokenBalanceParameters) {
        const wallet = parameters.wallet ?? walletClient.getAddress();

        let resolvedWalletAddress: string;
        if (walletClient instanceof EVMWalletClient) {
            resolvedWalletAddress = await walletClient.resolveAddress(wallet);
        } else {
            resolvedWalletAddress = wallet;
        }

        const queryParams = new URLSearchParams();
        queryParams.append("currencies", parameters.currencies.join(","));

        if (parameters.chains && parameters.chains.length > 0) {
            queryParams.append("chains", parameters.chains.join(","));
        }

        const endpoint = `/api/v1-alpha2/wallets/${encodeURIComponent(resolvedWalletAddress)}/balances`;
        const url = `${this.client.baseUrl}${endpoint}${queryParams.toString() ? `?${queryParams}` : ""}`;

        const response = await fetch(url, {
            method: "GET",
            headers: this.client.authHeaders,
        });

        if (!response.ok) {
            throw new Error(`Failed to get balances: ${await response.text()}`);
        }

        return (await response.json()) as GetWalletBalanceResponse;
    }
}
