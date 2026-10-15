import { PluginBase } from "@goat-sdk/core";
import type { Chain, WalletClientBase } from "@goat-sdk/core";
import type { MizanOptions } from "./mizan.api";
import { MizanService } from "./mizan.service";

/**
 * MIZAN plugin: verify zero-knowledge track-record credentials (VTR-1) before an agent
 * trusts, pays, copies or allocates to another agent's performance claim.
 * Read-only HTTPS, no API key, no wallet calls.
 */
export class MizanPlugin extends PluginBase<WalletClientBase> {
    constructor(options: MizanOptions = {}) {
        super("mizan", [new MizanService(options)]);
    }

    /**
     * MIZAN is a data provider, so it supports all chains
     */
    supportsChain = (chain: Chain) => true;
}

export function mizan(options: MizanOptions = {}) {
    return new MizanPlugin(options);
}
