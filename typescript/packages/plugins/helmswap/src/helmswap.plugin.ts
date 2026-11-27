import { type Chain, PluginBase } from "@goat-sdk/core";
import type { EVMWalletClient } from "@goat-sdk/wallet-evm";
import type { SolanaWalletClient } from "@goat-sdk/wallet-solana";
import { DEFAULT_HELMSWAP_BASE_URL, HELMSWAP_EVM_CHAIN_IDS, HelmswapApi } from "./api";
import { HelmswapSolanaService } from "./helmswap-solana.service";
import { HelmswapService } from "./helmswap.service";

export type HelmswapCtorParams = {
    /** Override the API base URL. Defaults to https://helmswap.com. */
    baseUrl?: string;
};

export type HelmswapSolanaCtorParams = HelmswapCtorParams & {
    /** Free HelmSwap API key (https://helmswap.com/developers). Required to build Solana swaps; quotes work without it. */
    apiKey?: string;
};

export class HelmswapPlugin extends PluginBase<EVMWalletClient> {
    constructor(params: HelmswapCtorParams = {}) {
        super("helmswap", [new HelmswapService(new HelmswapApi(params.baseUrl ?? DEFAULT_HELMSWAP_BASE_URL))]);
    }

    supportsChain = (chain: Chain) => chain.type === "evm" && HELMSWAP_EVM_CHAIN_IDS.includes(chain.id);
}

export class HelmswapSolanaPlugin extends PluginBase<SolanaWalletClient> {
    constructor(params: HelmswapSolanaCtorParams = {}) {
        super("helmswap-solana", [
            new HelmswapSolanaService(new HelmswapApi(params.baseUrl ?? DEFAULT_HELMSWAP_BASE_URL, params.apiKey)),
        ]);
    }

    supportsChain = (chain: Chain) => chain.type === "solana";
}

/** HelmSwap swaps for EVM wallets. */
export function helmswap(params?: HelmswapCtorParams) {
    return new HelmswapPlugin(params);
}

/** HelmSwap swaps for Solana wallets. */
export function helmswapSolana(params?: HelmswapSolanaCtorParams) {
    return new HelmswapSolanaPlugin(params);
}
