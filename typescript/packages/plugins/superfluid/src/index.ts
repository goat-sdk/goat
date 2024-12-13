import type { Chain, EVMWalletClient, Plugin } from "@goat-sdk/core";
<<<<<<< HEAD
<<<<<<< HEAD
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
=======
import { PEPE, type Token, USDC, getTokensForNetwork } from "./token";
=======
>>>>>>> 4e5c6e8 (add first commits)
import { getTools } from "./tools";

export function superfluid(): Plugin<EVMWalletClient> {
    return {
<<<<<<< HEAD
        name: "ERC20",
        supportsChain: (chain: Chain) => chain.type === "evm",
>>>>>>> 906163d (start superfluid plugin)
=======
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
>>>>>>> 4e5c6e8 (add first commits)
        supportsSmartWallets: () => true,
        getTools: async (chain: Chain) => {
            const network = chain;

            if (!network.id) {
                throw new Error("Network ID is required");
            }
<<<<<<< HEAD
<<<<<<< HEAD
            return getTools();
=======

            const tokenList = getTokensForNetwork(network.id, tokens);
            return getTools(tokenList);
>>>>>>> 906163d (start superfluid plugin)
=======
            return getTools();
>>>>>>> 4e5c6e8 (add first commits)
        },
    };
}
