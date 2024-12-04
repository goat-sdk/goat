import type { Chain, EVMWalletClient, Plugin } from "@goat-sdk/core";
import { getTools } from "./tools";
import { polygon } from "viem/chains";
import { type ApiKeyCredentials, createOrder, createOrDeriveAPIKey } from "./api";

export type PolymarketOptions = {
    credentials: ApiKeyCredentials;
};

export function polymarket({
    credentials,
}: PolymarketOptions): Plugin<EVMWalletClient> {
    return {
        name: "Polymarket",
        supportsChain: (chain: Chain) =>
            chain.type === "evm" && chain.id === polygon.id,
        supportsSmartWallets: () => false,
        getTools: async () => {
            return getTools({
                credentials,
            });
        },
    };
}

export { createOrDeriveAPIKey, createOrder };
