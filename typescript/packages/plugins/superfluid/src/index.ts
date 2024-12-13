import type { Chain, EVMWalletClient, Plugin } from "@goat-sdk/core";
import { getTools } from "./tools";

export function superfluid(): Plugin<EVMWalletClient> {
    return {
        name: "superfluid",
        supportsChain: (chain: Chain) =>
            chain.type === "evm" &&
            [
                8453, // Base
                10, // Optimism Mainnet
                11155420, // Optimism Sepolia
                137, // Polygon
                43113, // Avalanche Fuji
                43114, // Avalanche C-Chain
                100, // Gnosis Chain
                56, // BNB Chain
                69420, // DegenChain
                1, // Ethereum Mainnet
                42161, // Arbitrum
                42220, // Celo
                11155111, // Ethereum Sepolia
                534352, // Scroll
                534351, // Scroll Sepolia
                84532, // Base Sepolia
            ].includes(chain.id as number),
        supportsSmartWallets: () => true,
        getTools: async (chain: Chain) => {
            const network = chain;

            if (!network.id) {
                throw new Error("Network ID is required");
            }
            return getTools();
        },
    };
}
