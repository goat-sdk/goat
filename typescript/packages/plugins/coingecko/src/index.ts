import type { Plugin, WalletClient } from "@goat-sdk/core";
import { getTools } from "./tools";

export function coingecko(credentials: {
	apiKey: string;
}): Plugin<WalletClient> {
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
