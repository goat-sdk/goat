import { PluginBase } from "@goat-sdk/core";
import { BhairabService } from "./bhairab.service";

interface BhairabPluginOptions {
    /**
     * Optional Bhairab API key. Without it, scans return a free heuristic verdict;
     * with it, scans return an AI-reasoned verdict. Get one at https://tao-gateway.vercel.app
     */
    apiKey?: string;
}

/**
 * Plugin for Bhairab — a pre-trade token risk scanner.
 * Lets an agent check whether a Solana token is safe to buy (proceed / caution /
 * stop) before executing, catching honeypots and rugs.
 */
export class BhairabPlugin extends PluginBase {
    constructor({ apiKey }: BhairabPluginOptions = {}) {
        super("bhairab", [new BhairabService(apiKey)]);
    }

    // Data/safety provider — chain-agnostic at the plugin level (scans Solana tokens).
    supportsChain = () => true;
}

/**
 * Utility factory for creating a BhairabPlugin instance.
 */
export function bhairab(options: BhairabPluginOptions = {}) {
    return new BhairabPlugin(options);
}
