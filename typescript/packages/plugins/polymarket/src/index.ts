import type { Chain, EVMWalletClient, Plugin } from "@goat-sdk/core";
import { polygon } from "viem/chains";
import { type ApiKeyCredentials, createOrDeriveAPIKey, createOrder } from "./api";
import { getTools } from "./tools";

export type PolymarketOptions = {
    credentials: ApiKeyCredentials;
};

export function polymarket({ credentials }: PolymarketOptions): Plugin<EVMWalletClient> {
    return {
        name: "Polymarket",
        supportsChain: (chain: Chain) => chain.type === "evm" && chain.id === polygon.id,
        supportsSmartWallets: () => false,
        getTools: async () => {
            return getTools({
                credentials,
            });
        },
    };
}

export { createOrDeriveAPIKey, createOrder };
