import { Tool } from "@goat-sdk/core";
import type { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { BirdEyePlugin } from "../index";
import type { BirdEyeOptions } from "../index";
import {
    DefiHistoricalPriceUnixParameters,
    DefiHistoryPriceParameters,
    DefiMultiPriceParameters,
    DefiPriceParameters,
} from "../parameters";

export class BirdEyeDefiService {
    constructor(private readonly plugin: BirdEyePlugin) {}

    private async getChainName(walletClient: EVMWalletClient) {
        const chain = await walletClient.getChain();
        return this.plugin.getBirdEyeChainName(chain);
    }

    @Tool({
        description: "Get price information for a token",
    })
    async getDefiPrice(walletClient: EVMWalletClient, params: DefiPriceParameters) {
        const chain = await this.getChainName(walletClient);
        const endpoint = `/defi/price?chain=${chain}&address=${params.address}`;
        const response = await this.plugin.makeRequest(endpoint);
        return response.data;
    }

    @Tool({
        description: "Get price information for multiple tokens (max 100)",
    })
    async getDefiMultiPrice(walletClient: EVMWalletClient, params: DefiMultiPriceParameters) {
        const chain = await this.getChainName(walletClient);
        const endpoint = `/defi/multi_price?chain=${chain}&addresses=${params.token_addresses.join(",")}`;
        const response = await this.plugin.makeRequest(endpoint);
        return response.data;
    }

    @Tool({
        description: "Get historical price line chart for a token",
    })
    async getDefiHistoryPrice(walletClient: EVMWalletClient, params: DefiHistoryPriceParameters) {
        const chain = await this.getChainName(walletClient);
        const endpoint = `/defi/history_price?chain=${chain}&address=${params.address}&type=${params.type}${params.limit ? `&limit=${params.limit}` : ""}`;
        const response = await this.plugin.makeRequest(endpoint);
        return response.data;
    }

    @Tool({
        description: "Get historical price by unix timestamp",
    })
    async getDefiHistoricalPriceUnix(walletClient: EVMWalletClient, params: DefiHistoricalPriceUnixParameters) {
        const chain = await this.getChainName(walletClient);
        const endpoint = `/defi/historical_price_unix?chain=${chain}&address=${params.address}&timestamp=${params.timestamp}`;
        const response = await this.plugin.makeRequest(endpoint);
        return response.data;
    }
}
