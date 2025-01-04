import { Tool } from "@goat-sdk/core";
import type { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { BirdEyePlugin } from "../index";
import type { BirdEyeOptions } from "../index";
import {
    DefiOhlcvBaseQuoteParameters,
    DefiOhlcvPairParameters,
    DefiOhlcvParameters,
    DefiPriceVolumeMultiParameters,
    DefiPriceVolumeSingleParameters,
} from "../parameters";

export class BirdEyeMarketService {
    constructor(private readonly plugin: BirdEyePlugin) {}

    private async getChainName(walletClient: EVMWalletClient) {
        const chain = await walletClient.getChain();
        return this.plugin.getBirdEyeChainName(chain);
    }

    @Tool({
        description: "Get OHLCV price of token",
    })
    async getDefiOhlcv(walletClient: EVMWalletClient, params: DefiOhlcvParameters) {
        const chain = await this.getChainName(walletClient);
        const endpoint = `/defi/ohlcv?chain=${chain}&address=${params.address}&type=${params.type}${params.limit ? `&limit=${params.limit}` : ""}`;
        const response = await this.plugin.makeRequest(endpoint);
        return response.data;
    }

    @Tool({
        description: "Get OHLCV price of pair",
    })
    async getOhlcvPair(walletClient: EVMWalletClient, params: DefiOhlcvPairParameters) {
        const chain = await this.getChainName(walletClient);
        const endpoint = `/defi/ohlcv/pair?chain=${chain}&pair_address=${params.pair_address}&type=${params.type}${params.limit ? `&limit=${params.limit}` : ""}`;
        const response = await this.plugin.makeRequest(endpoint);
        return response.data;
    }

    @Tool({
        description: "Get OHLCV price of base-quote pair",
    })
    async getDefiOhlcvBaseQuote(walletClient: EVMWalletClient, params: DefiOhlcvBaseQuoteParameters) {
        const chain = await this.getChainName(walletClient);
        const endpoint = `/defi/ohlcv/base_quote?chain=${chain}&base_address=${params.base_address}&quote_address=${params.quote_address}&type=${params.type}${params.limit ? `&limit=${params.limit}` : ""}`;
        const response = await this.plugin.makeRequest(endpoint);
        return response.data;
    }

    @Tool({
        description: "Get price and volume updates of token",
    })
    async getDefiPriceVolumeSingle(walletClient: EVMWalletClient, params: DefiPriceVolumeSingleParameters) {
        const chain = await this.getChainName(walletClient);
        const endpoint = `/defi/price_volume/single?chain=${chain}&address=${params.address}`;
        const response = await this.plugin.makeRequest(endpoint);
        return response.data;
    }

    @Tool({
        description: "Get price and volume updates (max 50 tokens)",
    })
    async getDefiPriceVolumeMulti(walletClient: EVMWalletClient, params: DefiPriceVolumeMultiParameters) {
        const chain = await this.getChainName(walletClient);
        const response = await this.plugin.makeRequest("/defi/price_volume/multi", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chain,
                token_addresses: params.token_addresses,
            }),
        });
        return response.data;
    }
}
