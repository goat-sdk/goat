import { type Chain, PluginBase } from "@goat-sdk/core";
import type { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { BirdEyeDefiService } from "./services/defi.service";
import { BirdEyeMarketService } from "./services/market.service";
import { BirdEyeTransactionService } from "./services/transaction.service";

/**
 * Options for the BirdEye plugin
 */
export interface BirdEyeOptions {
    /** API key for BirdEye API authentication */
    apiKey: string;
}

/**
 * BirdEye plugin for accessing DeFi, Token, Wallet, and Trader data
 */
export class BirdEyePlugin extends PluginBase<EVMWalletClient> {
    private readonly baseUrl = "https://public-api.birdeye.so";
    private readonly chainMapping: Record<string, { type: string; chainId?: number; birdeyeChain: string }> = {
        // EVM chains
        "evm-1": { type: "evm", chainId: 1, birdeyeChain: "ethereum" },
        "evm-10": { type: "evm", chainId: 10, birdeyeChain: "optimism" },
        "evm-137": { type: "evm", chainId: 137, birdeyeChain: "polygon" },
        "evm-324": { type: "evm", chainId: 324, birdeyeChain: "zksync" },
        "evm-42161": { type: "evm", chainId: 42161, birdeyeChain: "arbitrum" },
        "evm-43114": { type: "evm", chainId: 43114, birdeyeChain: "avalanche" },
        "evm-56": { type: "evm", chainId: 56, birdeyeChain: "bsc" },
        "evm-8453": { type: "evm", chainId: 8453, birdeyeChain: "base" },
        // Non-EVM chains
        solana: { type: "solana", birdeyeChain: "solana" },
        sui: { type: "sui", birdeyeChain: "sui" },
    };

    constructor(private readonly options: BirdEyeOptions) {
        super("birdeye", [
            new BirdEyeDefiService(options),
            new BirdEyeMarketService(options),
            new BirdEyeTransactionService(options),
        ]);
    }

    supportsChain(chain: Chain): boolean {
        if (chain.type === "evm") {
            return Object.values(this.chainMapping).some(
                (mapping) => mapping.type === "evm" && mapping.chainId === chain.id,
            );
        }
        return chain.type in this.chainMapping;
    }

    getBirdEyeChainName(chain: Chain): string {
        if (chain.type === "evm") {
            const mapping = Object.values(this.chainMapping).find(
                (mapping) => mapping.type === "evm" && mapping.chainId === chain.id,
            );
            if (!mapping) {
                throw new Error(`Chain with ID ${chain.id} is not supported by BirdEye`);
            }
            return mapping.birdeyeChain;
        }

        const mapping = this.chainMapping[chain.type];
        if (!mapping) {
            throw new Error(`Chain type ${chain.type} is not supported by BirdEye`);
        }
        return mapping.birdeyeChain;
    }

    /**
     * Helper method to make authenticated requests to BirdEye API
     */
    async makeRequest(endpoint: string, options: RequestInit = {}) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: {
                ...options.headers,
                "X-API-KEY": this.options.apiKey,
            },
        });

        if (!response.ok) {
            if (response.status === 429) {
                throw new Error("BirdEye API rate limit exceeded");
            }
            throw new Error(`BirdEye API request failed: ${response.statusText}`);
        }

        return response.json();
    }
}

/**
 * Factory function to create a new BirdEye plugin instance
 */
export function birdEye(options: BirdEyeOptions) {
    return new BirdEyePlugin(options);
}
