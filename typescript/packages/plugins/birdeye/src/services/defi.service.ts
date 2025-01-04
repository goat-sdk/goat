import { Tool } from "@goat-sdk/core";
import type { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { BirdEyePlugin } from "../index";
import type { BirdEyeOptions } from "../index";
import {
    DefiPriceParameters,
    DefiMultiPriceParameters,
    DefiHistoryPriceParameters,
    DefiHistoricalPriceUnixParameters,
} from "../parameters";

export class BirdEyeDefiService {
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
        description: "Get price information for a token",
    })
    async getDefiPrice(walletClient: EVMWalletClient, params: DefiPriceParameters) {
        const response = await fetch(
            `https://public-api.birdeye.so/defi/price?chain=${await this.getChainName(walletClient)}&address=${params.address}`,
            {
                headers: { "X-API-KEY": this.plugin.options.apiKey },
            },
        );
        return this.handleApiError(response);
    }

    @Tool({
        description: "Get price information for multiple tokens (max 100)",
    })
    async getDefiMultiPrice(walletClient: EVMWalletClient, params: DefiMultiPriceParameters) {
        const response = await fetch(
            `https://public-api.birdeye.so/defi/multi_price?chain=${await this.getChainName(walletClient)}&addresses=${params.token_addresses.join(",")}`,
            {
                headers: { "X-API-KEY": this.plugin.options.apiKey },
            },
        );
        return this.handleApiError(response);
    }

    @Tool({
        description: "Get historical price line chart for a token",
    })
    async getDefiHistoryPrice(walletClient: EVMWalletClient, params: DefiHistoryPriceParameters) {
        const url = new URL("https://public-api.birdeye.so/defi/history_price");
        url.searchParams.set("chain", await this.getChainName(walletClient));
        url.searchParams.set("address", params.address);
        url.searchParams.set("type", params.type);
        if (params.limit) url.searchParams.set("limit", params.limit.toString());

        const response = await fetch(url.toString(), {
            headers: { "X-API-KEY": this.plugin.options.apiKey },
        });
        return this.handleApiError(response);
    }

    @Tool({
        description: "Get historical price by unix timestamp",
    })
    async getDefiHistoricalPriceUnix(walletClient: EVMWalletClient, params: DefiHistoricalPriceUnixParameters) {
        const response = await fetch(
            `https://public-api.birdeye.so/defi/historical_price_unix?chain=${await this.getChainName(walletClient)}&address=${params.address}&timestamp=${params.timestamp}`,
            {
                headers: { "X-API-KEY": this.plugin.options.apiKey },
            },
        );
        return this.handleApiError(response);
    }
}
