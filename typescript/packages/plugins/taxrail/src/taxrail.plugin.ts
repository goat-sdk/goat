import { PluginBase } from "@goat-sdk/core";
import type { Chain, WalletClientBase } from "@goat-sdk/core";
import { TaxRailService } from "./taxrail.service";

export interface TaxRailPluginConfig {
    baseUrl?: string;
    referrerWallet?: string;
}

/**
 * TaxRail plugin for pre-execution US (IRS 1099-DA, HIFO/SpecID, TLH, Aave v3 borrow-vs-sell)
 * and Brazil (Lei 14.754, R$35k rule) crypto tax optimization.
 */
export class TaxRailPlugin extends PluginBase<WalletClientBase> {
    constructor(config: TaxRailPluginConfig = {}) {
        super("taxrail", [new TaxRailService(config)]);
    }

    supportsChain = (_chain: Chain) => true;
}

export function taxrail(config: TaxRailPluginConfig = {}) {
    return new TaxRailPlugin(config);
}
