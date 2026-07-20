import { PluginBase, Tool } from "@goat-sdk/core";
import type { Chain } from "@goat-sdk/core";
import { fetchYieldSignal } from "./client";
import { GetYieldSignalParameters } from "./parameters";

class YieldSignalToolset {
    @Tool({
        name: "get_yield_signal",
        description:
            "Real-time risk-weighted USDC or WETH lending APY across Aave, Compound, Morpho, Moonwell, Euler and Fluid on Base. Costs $0.01 USDC per call via x402.",
    })
    async getYieldSignal(parameters: GetYieldSignalParameters): Promise<string> {
        const signal = await fetchYieldSignal(parameters.asset);
        return JSON.stringify(signal);
    }
}

export class YieldSignalPlugin extends PluginBase {
    constructor() {
        super("yieldsignal", [new YieldSignalToolset()]);
    }

    // Payment is routed via an EVM CDP wallet on Base specifically — not
    // chain-agnostic like a plain read-only price API.
    supportsChain = (chain: Chain): boolean => chain.type === "evm";
}

export function yieldsignal(): YieldSignalPlugin {
    return new YieldSignalPlugin();
}
