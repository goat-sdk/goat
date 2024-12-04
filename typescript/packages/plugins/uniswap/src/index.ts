import type { Chain, EVMWalletClient, Plugin } from "@goat-sdk/core";
import { getTools } from "./tools";
import { mainnet } from "viem/chains";
import { type ApiKeyCredentials, createOrder, createOrDeriveAPIKey } from "./api";

export type UniswapOptions = {
    credentials: ApiKeyCredentials;
};

export function uniswap({
    credentials,
}: UniswapOptions): Plugin<EVMWalletClient> {
    return {
        name: "Uniswap",
        supportsChain: (chain: Chain) =>
            chain.type === "evm" && chain.id === mainnet.id,
        supportsSmartWallets: () => false,
        getTools: async () => {
            return getTools({
                credentials,
            });
        },
    };
}

export { createOrDeriveAPIKey, createOrder };
