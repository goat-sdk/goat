import type { Plugin, SolanaWalletClient } from "@goat-sdk/core";
import type { Connection } from "@solana/web3.js";
import { getTools } from "./tools";

export function tensor(params: { connection: Connection; apiKey: string }): Plugin<SolanaWalletClient> {
    return {
        name: "tensor",
        supportsSmartWallets: () => false,
        supportsChain: (chain) => chain.type === "solana",
        getTools: async (walletClient: SolanaWalletClient) =>
            getTools({ walletClient, connection: params.connection, apiKey: params.apiKey }),
    };
}
