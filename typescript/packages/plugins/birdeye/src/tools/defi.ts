import { type ToolBase, createTool } from "@goat-sdk/core";
import type { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { type BirdEyeOptions, BirdEyePlugin } from "../index";
import {
    defiHistoricalPriceUnixParametersSchema,
    defiHistoryPriceParametersSchema,
    defiMultiPriceParametersSchema,
    defiNetworksParametersSchema,
    defiPriceParametersSchema,
    defiPriceVolumeMultiParametersSchema,
} from "../parameters";

export function getDefiTools(walletClient: EVMWalletClient, options: BirdEyeOptions): ToolBase[] {
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
                name: "birdeye_get_defi_price_volume_multi",
                description: "Get price and volume data for multiple tokens",
                parameters: defiPriceVolumeMultiParametersSchema,
            },
            async (params) => {
                const response = await fetch("https://public-api.birdeye.so/defi/price_volume_multi", {
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
                    `https://public-api.birdeye.so/defi/multi_price?chain=${await getChainName()}&addresses=${params.addresses.join(",")}`,
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
                    `https://public-api.birdeye.so/defi/historical_price_unix?chain=${await getChainName()}&address=${params.address}&timestamp=${params.timestamp}`,
                    {
                        headers: { "X-API-KEY": options.apiKey },
                    },
                );
                return handleApiError(response);
            },
        ),
    ];
}
