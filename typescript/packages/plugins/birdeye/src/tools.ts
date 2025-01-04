import { type ToolBase, createTool } from "@goat-sdk/core";
import type { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { type BirdEyeOptions, BirdEyePlugin } from "./index";
import {
    chainSchema,
    defiHistoricalPriceUnixParametersSchema,
    defiHistoryPriceParametersSchema,
    defiMultiPriceParametersSchema,
    defiNetworksParametersSchema,
    defiOhlcvBaseQuoteParametersSchema,
    defiOhlcvPairParametersSchema,
    defiOhlcvParametersSchema,
    defiPairTxsParametersSchema,
    defiPriceParametersSchema,
    defiPriceVolumeMultiParametersSchema,
    defiPriceVolumeSingleParametersSchema,
    defiTokenTxsParametersSchema,
    defiTxsSeekByTimeParametersSchema,
} from "./parameters";

/**
 * Get all tools for the BirdEye plugin
 */
export function getTools(walletClient: EVMWalletClient, options: BirdEyeOptions): ToolBase[] {
    // Chain validation is handled by the plugin's getBirdEyeChainName method
    const plugin = new BirdEyePlugin(options);

    const getChainName = async () => {
        const chain = await walletClient.getChain();
        return plugin.getBirdEyeChainName(chain);
    };

    const handleApiError = async (response: Response) => {
        if (!response.ok) {
            if (response.status === 429) {
                throw new Error("BirdEye API rate limit exceeded");
            }
            throw new Error(`BirdEye API request failed: ${response.statusText}`);
        }
        return response.json();
    };

    return [
        createTool(
            {
                name: "birdeye_get_defi_networks",
                description: "Retrieve list of supported networks from BirdEye",
                parameters: defiNetworksParametersSchema,
            },
            async () => {
                const response = await fetch("https://public-api.birdeye.so/defi/networks", {
                    headers: { "X-API-KEY": options.apiKey },
                });
                return handleApiError(response);
            },
        ),
        createTool(
            {
                name: "birdeye_get_defi_price",
                description: "Get price information for a token on a specific chain",
                parameters: defiPriceParametersSchema,
            },
            async (params) => {
                const response = await fetch(
                    `https://public-api.birdeye.so/defi/price?chain=${await getChainName()}&address=${params.address}`,
                    {
                        headers: { "X-API-KEY": options.apiKey },
                    },
                );
                return handleApiError(response);
            },
        ),
        createTool(
            {
                name: "birdeye_get_defi_multi_price",
                description: "Get price information for multiple tokens (max 100)",
                parameters: defiMultiPriceParametersSchema,
            },
            async (params) => {
                const response = await fetch(
                    `https://public-api.birdeye.so/defi/multi_price?chain=${params.chain}&addresses=${params.addresses.join(",")}`,
                    {
                        headers: { "X-API-KEY": options.apiKey },
                    },
                );
                return handleApiError(response);
            },
        ),
        createTool(
            {
                name: "birdeye_get_defi_history_price",
                description: "Get historical price line chart for a token",
                parameters: defiHistoryPriceParametersSchema,
            },
            async (params) => {
                const url = new URL("https://public-api.birdeye.so/defi/history_price");
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
                name: "birdeye_get_defi_historical_price_unix",
                description: "Get historical price by unix timestamp",
                parameters: defiHistoricalPriceUnixParametersSchema,
            },
            async (params) => {
                const response = await fetch(
                    `https://public-api.birdeye.so/defi/historical_price_unix?chain=${params.chain}&address=${params.address}&timestamp=${params.timestamp}`,
                    {
                        headers: { "X-API-KEY": options.apiKey },
                    },
                );
                return handleApiError(response);
            },
        ),
        createTool(
            {
                name: "birdeye_get_defi_token_txs",
                description: "Get list of trades of a token",
                parameters: defiTokenTxsParametersSchema,
            },
            async (params) => {
                const url = new URL("https://public-api.birdeye.so/defi/txs/token");
                url.searchParams.set("chain", await getChainName());
                url.searchParams.set("address", params.address);
                if (params.page) url.searchParams.set("page", params.page.toString());
                if (params.limit) url.searchParams.set("limit", params.limit.toString());

                const response = await fetch(url.toString(), {
                    headers: { "X-API-KEY": options.apiKey },
                });
                return handleApiError(response);
            },
        ),
        createTool(
            {
                name: "birdeye_get_defi_pair_txs",
                description: "Get list of trades of a pair",
                parameters: defiPairTxsParametersSchema,
            },
            async (params) => {
                const url = new URL("https://public-api.birdeye.so/defi/txs/pair");
                url.searchParams.set("chain", await getChainName());
                url.searchParams.set("pair_address", params.pair_address);
                if (params.page) url.searchParams.set("page", params.page.toString());
                if (params.limit) url.searchParams.set("limit", params.limit.toString());

                const response = await fetch(url.toString(), {
                    headers: { "X-API-KEY": options.apiKey },
                });
                return handleApiError(response);
            },
        ),
        createTool(
            {
                name: "birdeye_get_defi_token_txs_by_time",
                description: "Get token trades within a time range",
                parameters: defiTxsSeekByTimeParametersSchema,
            },
            async (params) => {
                const url = new URL("https://public-api.birdeye.so/defi/txs/token/seek_by_time");
                url.searchParams.set("chain", await getChainName());
                url.searchParams.set("address", params.address);
                url.searchParams.set("from_time", params.from_time.toString());
                url.searchParams.set("to_time", params.to_time.toString());
                if (params.limit) url.searchParams.set("limit", params.limit.toString());

                const response = await fetch(url.toString(), {
                    headers: { "X-API-KEY": options.apiKey },
                });
                return handleApiError(response);
            },
        ),
        createTool(
            {
                name: "birdeye_get_defi_pair_txs_by_time",
                description: "Get pair trades within a time range",
                parameters: defiTxsSeekByTimeParametersSchema,
            },
            async (params) => {
                const url = new URL("https://public-api.birdeye.so/defi/txs/pair/seek_by_time");
                url.searchParams.set("chain", params.chain);
                url.searchParams.set("address", params.address);
                url.searchParams.set("from_time", params.from_time.toString());
                url.searchParams.set("to_time", params.to_time.toString());
                if (params.limit) url.searchParams.set("limit", params.limit.toString());

                const response = await fetch(url.toString(), {
                    headers: { "X-API-KEY": options.apiKey },
                });
                return handleApiError(response);
            },
        ),
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
                name: "birdeye_get_defi_ohlcv_pair",
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
