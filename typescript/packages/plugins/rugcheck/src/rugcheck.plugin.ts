import { type Chain, PluginBase } from "@goat-sdk/core";
import { RugCheckApi } from "./api";
import { RugCheckService } from "./rugcheck.service";

export interface RugCheckOptions {
    jwtToken?: string;
}

export class RugCheckPlugin extends PluginBase {
    constructor() {
        super("rugcheck", [new RugCheckService(new RugCheckApi())]);
    }

    supportsChain(chain: Chain): boolean {
        return chain.type === "solana";
    }
}

/**
 * Factory function to create a new RugCheck plugin instance
 */
export function rugcheck() {
    return new RugCheckPlugin();
}
