import type { Chain, Plugin, WalletClient } from "@goat-sdk/core";
import { getTools } from "./tools";

export function kimProtocolPlugin(): Plugin<WalletClient> {
    return {
        name: "KIM Protocol",
        supportsChain: (chain: Chain) => chain.type === "evm",
        supportsSmartWallets: () => true,
        getTools: getTools,
    };
}

export * from "./tools"; 