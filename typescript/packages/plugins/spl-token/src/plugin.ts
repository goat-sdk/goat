import type { Plugin, SolanaWalletClient } from "@goat-sdk/core";
import type { Connection } from "@solana/web3.js";
import type { SolanaNetwork, Token } from "./tokens";
import { getTokensForNetwork } from "./utils/getTokensForNetwork";
import { getTools } from "./utils/getTools";

export function splToken({
    tokens,
    connection,
    network,
}: { tokens: Token[]; connection: Connection; network: SolanaNetwork }): Plugin<SolanaWalletClient> {
    return {
        name: "splToken",
        supportsSmartWallets: () => false,
        supportsChain: (chain) => chain.type === "solana",
        getTools: async () => {
            const tokenList = getTokensForNetwork(network, tokens);
            return getTools(tokenList, connection);
        },
    };
}
