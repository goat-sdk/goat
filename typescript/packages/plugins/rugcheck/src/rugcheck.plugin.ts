import { type Chain, PluginBase } from "@goat-sdk/core";
import { RugCheckApi } from "./api";
import { RugCheckService } from "./rugcheck.service";

export interface RugCheckOptions {
    jwtToken?: string;
}

export class RugCheckPlugin extends PluginBase {
    constructor(options: RugCheckOptions) {
        super("rugcheck", [new RugCheckService(new RugCheckApi(options.jwtToken))]);
    }

    supportsChain(chain: Chain): boolean {
        return chain.type === "solana";
    }
}

/**
 * Factory function to create a new RugCheck plugin instance
 */
export function rugcheck(options: RugCheckOptions) {
    return new RugCheckPlugin(options);
}
