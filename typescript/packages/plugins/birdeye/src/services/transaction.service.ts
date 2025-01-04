import { Tool } from "@goat-sdk/core";
import type { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { BirdEyePlugin } from "../index";
import type { BirdEyeOptions } from "../index";
import {
    TransactionHistoryParameters,
    WalletTransactionHistoryParameters,
} from "../parameters";

export class BirdEyeTransactionService {
    private plugin: BirdEyePlugin;

    constructor(options: BirdEyeOptions) {
        this.plugin = new BirdEyePlugin(options);
    }

    private async getChainName(walletClient: EVMWalletClient) {
        const chain = await walletClient.getChain();
        return this.plugin.getBirdEyeChainName(chain);
    }

    private async handleApiError(response: Response) {
        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }
        const json = await response.json();
        return json.data;
    }

    @Tool({
        description: "Get transaction history for a token",
    })
    async getTransactionHistory(walletClient: EVMWalletClient, params: TransactionHistoryParameters) {
        const url = new URL("https://public-api.birdeye.so/defi/tx_history");
        url.searchParams.set("chain", await this.getChainName(walletClient));
        url.searchParams.set("address", params.address);
        if (params.limit) url.searchParams.set("limit", params.limit.toString());
        if (params.offset) url.searchParams.set("offset", params.offset.toString());

        const response = await fetch(url.toString(), {
            headers: { "X-API-KEY": this.plugin.options.apiKey },
        });
        return this.handleApiError(response);
    }

    @Tool({
        description: "Get transaction history for a wallet",
    })
    async getWalletTransactionHistory(walletClient: EVMWalletClient, params: WalletTransactionHistoryParameters) {
        const url = new URL("https://public-api.birdeye.so/defi/wallet_tx_history");
        url.searchParams.set("chain", await this.getChainName(walletClient));
        url.searchParams.set("wallet", params.wallet);
        if (params.limit) url.searchParams.set("limit", params.limit.toString());
        if (params.offset) url.searchParams.set("offset", params.offset.toString());

        const response = await fetch(url.toString(), {
            headers: { "X-API-KEY": this.plugin.options.apiKey },
        });
        return this.handleApiError(response);
    }
}
