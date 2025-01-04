import { type ToolBase, createTool } from "@goat-sdk/core";
import type { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { type BirdEyeOptions, BirdEyePlugin } from "../index";
import {
    defiOhlcvBaseQuoteParametersSchema,
    defiOhlcvPairParametersSchema,
    defiOhlcvParametersSchema,
    defiPriceVolumeMultiParametersSchema,
    defiPriceVolumeSingleParametersSchema,
} from "../parameters";

export function getMarketTools(walletClient: EVMWalletClient, options: BirdEyeOptions): ToolBase[] {
    const plugin = new BirdEyePlugin(options);

    const getChainName = async () => {
        const chain = await walletClient.getChain();
        return plugin.getBirdEyeChainName(chain);
    };

    const handleApiError = async (response: Response) => {
        if (!response.ok) {
            throw new Error("API request failed");
        }
        const json = await response.json();
        return json.data;
    };

    return [
        createTool(
            {
                name: "birdeye_get_defi_ohlcv",
                description: "Get OHLCV price of token",
                parameters: defiOhlcvParametersSchema,
            },
            async (params) => {
                const url = new URL("https://public-api.birdeye.so/defi/ohlcv");
                url.searchParams.set("chain", await getChainName());
                url.searchParams.set("address", params.address);
                url.searchParams.set("type", params.type);
                if (params.limit) url.searchParams.set("limit", params.limit.toString());

                const response = await fetch(url.toString(), {
                    headers: { "X-API-KEY": options.apiKey },
                });
                return handleApiError(response);
            },
        ),
        createTool(
            {
                name: "birdeye_get_ohlcv_pair",
                description: "Get OHLCV price of pair",
                parameters: defiOhlcvPairParametersSchema,
            },
            async (params) => {
                const url = new URL("https://public-api.birdeye.so/defi/ohlcv/pair");
                url.searchParams.set("chain", await getChainName());
                url.searchParams.set("pair_address", params.pair_address);
                url.searchParams.set("type", params.type);
                if (params.limit) url.searchParams.set("limit", params.limit.toString());

                const response = await fetch(url.toString(), {
                    headers: { "X-API-KEY": options.apiKey },
                });
                return handleApiError(response);
            },
        ),
        createTool(
            {
                name: "birdeye_get_defi_ohlcv_base_quote",
                description: "Get OHLCV price of base-quote pair",
                parameters: defiOhlcvBaseQuoteParametersSchema,
            },
            async (params) => {
                const url = new URL("https://public-api.birdeye.so/defi/ohlcv/base_quote");
                url.searchParams.set("chain", await getChainName());
                url.searchParams.set("base_address", params.base_address);
                url.searchParams.set("quote_address", params.quote_address);
                url.searchParams.set("type", params.type);
                if (params.limit) url.searchParams.set("limit", params.limit.toString());

                const response = await fetch(url.toString(), {
                    headers: { "X-API-KEY": options.apiKey },
                });
                return handleApiError(response);
            },
        ),
        createTool(
            {
                name: "birdeye_get_defi_price_volume_single",
                description: "Get price and volume updates of token",
                parameters: defiPriceVolumeSingleParametersSchema,
            },
            async (params) => {
                const url = new URL("https://public-api.birdeye.so/defi/price_volume/single");
                url.searchParams.set("chain", await getChainName());
                url.searchParams.set("address", params.address);

                const response = await fetch(url.toString(), {
                    headers: { "X-API-KEY": options.apiKey },
                });
                return handleApiError(response);
            },
        ),
        createTool(
            {
                name: "birdeye_get_defi_price_volume_multi",
                description: "Get price and volume updates (max 50 tokens)",
                parameters: defiPriceVolumeMultiParametersSchema,
            },
            async (params) => {
                const response = await fetch("https://public-api.birdeye.so/defi/price_volume/multi", {
                    method: "POST",
                    headers: {
                        "X-API-KEY": options.apiKey,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        chain: await getChainName(),
                        token_addresses: params.token_addresses,
                    }),
                });
                return handleApiError(response);
            },
        ),
    ];
}
