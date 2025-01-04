import { Tool } from "@goat-sdk/core";
import type { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { BirdEyePlugin } from "../index";
import type { BirdEyeOptions } from "../index";
import { TransactionHistoryParameters, WalletTransactionHistoryParameters } from "../parameters";

export class BirdEyeTransactionService {
    constructor(private readonly plugin: BirdEyePlugin) {}

    private async getChainName(walletClient: EVMWalletClient) {
        const chain = await walletClient.getChain();
        return this.plugin.getBirdEyeChainName(chain);
    }

    @Tool({
        description: "Get transaction history for a token",
    })
    async getTransactionHistory(walletClient: EVMWalletClient, params: TransactionHistoryParameters) {
        const chain = await this.getChainName(walletClient);
        const endpoint = `/defi/tx_history?chain=${chain}&address=${params.address}${params.limit ? `&limit=${params.limit}` : ""}${params.offset ? `&offset=${params.offset}` : ""}`;
        const response = await this.plugin.makeRequest(endpoint);
        return response.data;
    }

    @Tool({
        description: "Get transaction history for a wallet",
    })
    async getWalletTransactionHistory(walletClient: EVMWalletClient, params: WalletTransactionHistoryParameters) {
        const chain = await this.getChainName(walletClient);
        const endpoint = `/defi/wallet_tx_history?chain=${chain}&wallet=${params.wallet}${params.limit ? `&limit=${params.limit}` : ""}${params.offset ? `&offset=${params.offset}` : ""}`;
        const response = await this.plugin.makeRequest(endpoint);
        return response.data;
    }
}
