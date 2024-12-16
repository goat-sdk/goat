import type { Plugin, SolanaWalletClient } from "@goat-sdk/core";
import type { Connection } from "@solana/web3.js";
import type { SolanaNetwork, Token } from "./tokens";
import { SPL_TOKENS } from "./tokens";
import { getTools } from "./utils/getTools";
export function splToken({
    connection,
    network,
    tokens = SPL_TOKENS,
}: { connection: Connection; network: SolanaNetwork; tokens?: Token[] }): Plugin<SolanaWalletClient> {
    return {
        name: "splToken",
        supportsSmartWallets: () => false,
        supportsChain: (chain) => chain.type === "solana",
        getTools: async (walletClient: SolanaWalletClient) => getTools(walletClient, connection, network, tokens),
    };
}
