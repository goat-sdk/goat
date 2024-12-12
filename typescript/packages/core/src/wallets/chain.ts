import * as allEVMChains from "viem/chains";

/**
 * @param type - "evm" or "solana", extend this union as needed (e.g., "sui")
 * @param id - Chain ID, optional for EVM
 */
export type Chain = {
    type: "evm" | "solana" | "aptos" | "chromia";
    id?: number; // optional for EVM
};

export type ChainToken = {
    symbol: string;
    name: string;
    decimals: number;
};

export function getChainToken(chain: Chain): ChainToken {
    switch (chain.type) {
        case "evm": {
            if (!chain.id) {
                throw new Error("Chain ID is required for EVM chains");
            }
            // Get all viem chains
            const allChains = Object.values(allEVMChains);
            // Find matching chain by ID
            const viemChain = allChains.find((c) => c.id === chain.id);

            if (!viemChain) {
                throw new Error(`Unsupported EVM chain ID: ${chain.id}`);
            }

            return {
                symbol: viemChain.nativeCurrency.symbol,
                name: viemChain.nativeCurrency.name,
                decimals: viemChain.nativeCurrency.decimals,
            };
        }
        case "solana":
            return {
                symbol: "SOL",
                name: "Solana",
                decimals: 9,
            };
        case "aptos":
            return {
                symbol: "APT",
                name: "Aptos Coin",
                decimals: 8,
            };
        case "chromia":
            return {
                symbol: "CHR",
                name: "Chroma",
                decimals: 6,
            };
        default:
            throw new Error(`Unsupported chain type: ${chain.type} ${chain.id ? `with id: ${chain.id}` : ""}`);
    }
}
