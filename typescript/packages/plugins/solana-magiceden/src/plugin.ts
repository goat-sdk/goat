import type { Plugin, SolanaWalletClient } from "@goat-sdk/core";
import type { Connection } from "@solana/web3.js";
import { getTools } from "./tools";

export function solanaMagicEden(params: { connection: Connection; apiKey: string }): Plugin<SolanaWalletClient> {
    return {
        name: "solana-magiceden",
        supportsSmartWallets: () => false,
        supportsChain: (chain) => chain.type === "solana",
        getTools: async () => getTools(params),
    };
}
