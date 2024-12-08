import type { EVMWalletClient, Plugin } from "@goat-sdk/core";
import { getTools } from "./tools";

export function worldstore(): Plugin<EVMWalletClient> {
	return {
		name: "worldstore",
		supportsChain: (chain) => chain.type === "evm",
		supportsSmartWallets: () => true,
		getTools: async () => getTools()
	};
}
