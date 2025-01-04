import { type ToolBase, createTool } from "@goat-sdk/core";
import type { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { type BirdEyeOptions, BirdEyePlugin } from "../index";
import {
    defiPairTxsParametersSchema,
    defiTokenTxsParametersSchema,
    defiTxsSeekByTimeParametersSchema,
} from "../parameters";

export function getTransactionTools(walletClient: EVMWalletClient, options: BirdEyeOptions): ToolBase[] {
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
    ];
}
