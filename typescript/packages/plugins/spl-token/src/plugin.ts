import type { Plugin, SolanaWalletClient } from "@goat-sdk/core";
import type { Cluster, Connection } from "@solana/web3.js";

import { getTools } from "./utils/getTools";

export function splToken({
    connection,
    network,
}: { connection: Connection; network: Cluster }): Plugin<SolanaWalletClient> {
    return {
        name: "splToken",
        supportsSmartWallets: () => false,
        supportsChain: (chain) => chain.type === "solana",
        getTools: async () => getTools(connection, network),
    };
}
