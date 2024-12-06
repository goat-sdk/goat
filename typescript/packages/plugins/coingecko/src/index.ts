import type { Chain, EVMWalletClient, Plugin } from "@goat-sdk/core";
import { getTools } from "./tools";

export function coingecko(credentials: {
	apiKey: string;
}): Plugin<any> {
	return {
		name: "coingecko",
		supportsChain: () => true,
		supportsSmartWallets: () => true,
		getTools: async () => {
			return getTools({
				apiKey: credentials.apiKey,
			});
		},
	};
}
