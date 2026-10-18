import { type Chain, PluginBase, type WalletClientBase } from "@goat-sdk/core";
import type { PredgePluginOptions } from "./predge.api";
import { PredgeService } from "./predge.service";

export class PredgePlugin extends PluginBase<WalletClientBase> {
    constructor(options: PredgePluginOptions = {}) {
        super("predge", [new PredgeService(options)]);
    }

    // Free tools work with any wallet; paid tools check for an EVM wallet on Base at call time.
    supportsChain = (_chain: Chain) => true;
}

export function predge(options: PredgePluginOptions = {}) {
    return new PredgePlugin(options);
}
