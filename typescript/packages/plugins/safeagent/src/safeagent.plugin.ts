import { type Chain, PluginBase } from "@goat-sdk/core";
import { SafeAgentService } from "./safeagent.service";

export class SafeAgentPlugin extends PluginBase {
    constructor() {
        super("safeagent", [new SafeAgentService()]);
    }

    supportsChain(chain: Chain): boolean {
        return ["base", "ethereum", "arbitrum", "optimism", "polygon", "bsc"].some(
            (c) => chain.type === "evm"
        );
    }
}

export function safeagent() {
    return new SafeAgentPlugin();
}
