import type { Chain, EVMWalletClient, Plugin } from "@goat-sdk/core";
import { mainnet } from "viem/chains";
import { getTools } from "./tools";

export type UniswapOptions = {
	apiKey: string;
	baseUrl: string;
};

export function uniswap({
	apiKey,
	baseUrl,
}: UniswapOptions): Plugin<EVMWalletClient> {
	return {
		name: "Uniswap",
		supportsChain: (chain: Chain) =>
			chain.type === "evm" && chain.id === mainnet.id,
		supportsSmartWallets: () => false,
		getTools: async () => {
			return getTools({
				apiKey,
				baseUrl,
			});
		},
	};
}

