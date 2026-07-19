import { PluginBase } from "@goat-sdk/core";
import type { Chain, WalletClientBase } from "@goat-sdk/core";
import { MadeOnSolService } from "./madeonsol.service";

export interface MadeOnSolOptions {
    /** MadeOnSol API key (msk_...). Free tier available at https://madeonsol.com/pricing */
    apiKey: string;
}

/**
 * Plugin for the MadeOnSol API — real-time Solana memecoin intelligence.
 *
 * Provides tools for KOL (key opinion leader) trade feeds, multi-KOL
 * coordination signals, pump.fun deployer reputation, token safety/buyer
 * quality, alpha-wallet discovery, and wallet PnL stats.
 */
export class MadeOnSolPlugin extends PluginBase<WalletClientBase> {
    constructor(options: MadeOnSolOptions) {
        super("madeonsol", [new MadeOnSolService(options.apiKey)]);
    }

    /**
     * Data-provider plugin: works on every chain, though the data itself is
     * Solana-centric.
     */
    supportsChain = (chain: Chain) => true;
}

/**
 * Factory function for creating a MadeOnSolPlugin instance
 */
export function madeonsol(options: MadeOnSolOptions) {
    return new MadeOnSolPlugin(options);
}
