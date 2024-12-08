import type { Chain, EVMWalletClient, Plugin } from "@goat-sdk/core";
import { arbitrum, avalanche, base, celo, mainnet, optimism, polygon, zora } from "viem/chains";
import { getTools } from "./tools";

export type UniswapOptions = {
    apiKey: string;
    baseUrl: string;
};

const SUPPORTED_CHAINS = [mainnet, polygon, avalanche, base, optimism, zora, arbitrum, celo];

export function uniswap({ apiKey, baseUrl }: UniswapOptions): Plugin<EVMWalletClient> {
    return {
        name: "Uniswap",
        supportsChain: (chain: Chain) => chain.type === "evm" && SUPPORTED_CHAINS.some((c) => c.id === chain.id),
        supportsSmartWallets: () => true,
        getTools: async () => {
            return getTools({
                apiKey,
                baseUrl,
            });
        },
    };
}
