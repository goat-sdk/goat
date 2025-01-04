import { Tool } from "@goat-sdk/core";
import type { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { BirdEyePlugin } from "../index";
import type { BirdEyeOptions } from "../index";
import {
    DefiOhlcvParameters,
    DefiOhlcvPairParameters,
    DefiOhlcvBaseQuoteParameters,
    DefiPriceVolumeSingleParameters,
    DefiPriceVolumeMultiParameters,
} from "../parameters";

export class BirdEyeMarketService {
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
        description: "Get OHLCV price of token",
    })
    async getDefiOhlcv(walletClient: EVMWalletClient, params: DefiOhlcvParameters) {
        const url = new URL("https://public-api.birdeye.so/defi/ohlcv");
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
        description: "Get OHLCV price of pair",
    })
    async getOhlcvPair(walletClient: EVMWalletClient, params: DefiOhlcvPairParameters) {
        const url = new URL("https://public-api.birdeye.so/defi/ohlcv/pair");
        url.searchParams.set("chain", await this.getChainName(walletClient));
        url.searchParams.set("pair_address", params.pair_address);
        url.searchParams.set("type", params.type);
        if (params.limit) url.searchParams.set("limit", params.limit.toString());

        const response = await fetch(url.toString(), {
            headers: { "X-API-KEY": this.plugin.options.apiKey },
        });
        return this.handleApiError(response);
    }

    @Tool({
        description: "Get OHLCV price of base-quote pair",
    })
    async getDefiOhlcvBaseQuote(walletClient: EVMWalletClient, params: DefiOhlcvBaseQuoteParameters) {
        const url = new URL("https://public-api.birdeye.so/defi/ohlcv/base_quote");
        url.searchParams.set("chain", await this.getChainName(walletClient));
        url.searchParams.set("base_address", params.base_address);
        url.searchParams.set("quote_address", params.quote_address);
        url.searchParams.set("type", params.type);
        if (params.limit) url.searchParams.set("limit", params.limit.toString());

        const response = await fetch(url.toString(), {
            headers: { "X-API-KEY": this.plugin.options.apiKey },
        });
        return this.handleApiError(response);
    }

    @Tool({
        description: "Get price and volume updates of token",
    })
    async getDefiPriceVolumeSingle(walletClient: EVMWalletClient, params: DefiPriceVolumeSingleParameters) {
        const url = new URL("https://public-api.birdeye.so/defi/price_volume/single");
        url.searchParams.set("chain", await this.getChainName(walletClient));
        url.searchParams.set("address", params.address);

        const response = await fetch(url.toString(), {
            headers: { "X-API-KEY": this.plugin.options.apiKey },
        });
        return this.handleApiError(response);
    }

    @Tool({
        description: "Get price and volume updates (max 50 tokens)",
    })
    async getDefiPriceVolumeMulti(walletClient: EVMWalletClient, params: DefiPriceVolumeMultiParameters) {
        const response = await fetch("https://public-api.birdeye.so/defi/price_volume/multi", {
            method: "POST",
            headers: {
                "X-API-KEY": this.plugin.options.apiKey,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                chain: await this.getChainName(walletClient),
                token_addresses: params.token_addresses,
            }),
        });
        return this.handleApiError(response);
    }
}
