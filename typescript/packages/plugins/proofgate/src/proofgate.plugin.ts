import { type Chain, PluginBase } from "@goat-sdk/core";
import { ProofGateAPI } from "./api";
import { ProofGateService } from "./proofgate.service";

// Supported EVM chains (19 total)
const SUPPORTED_CHAIN_IDS = new Set([
    // Layer 1
    1, // Ethereum
    56, // BNB Chain
    43114, // Avalanche
    250, // Fantom
    42220, // Celo
    100, // Gnosis
    // Layer 2
    8453, // Base
    42161, // Arbitrum
    10, // Optimism
    137, // Polygon
    324, // zkSync Era
    59144, // Linea
    534352, // Scroll
    5000, // Mantle
    1101, // Polygon zkEVM
    // Testnets
    84532, // Base Sepolia
    11155111, // Sepolia
    80002, // Polygon Amoy
    97, // BSC Testnet
]);

export interface ProofGatePluginOptions {
    /** ProofGate API key (starts with pg_live_) */
    apiKey: string;
    /** Automatically throw error on unsafe transactions (default: true) */
    autoBlock?: boolean;
}

export class ProofGatePlugin extends PluginBase {
    constructor({ apiKey, autoBlock = true }: ProofGatePluginOptions) {
        const api = new ProofGateAPI(apiKey);
        const service = new ProofGateService(api, autoBlock);

        super("proofgate", [service]);
    }

    supportsChain(chain: Chain): boolean {
        // Only support EVM chains
        if (chain.type !== "evm") {
            return false;
        }
        // Check if chain ID is in our supported list
        return SUPPORTED_CHAIN_IDS.has(chain.id);
    }
}

export function proofgate(options: ProofGatePluginOptions) {
    return new ProofGatePlugin(options);
}
