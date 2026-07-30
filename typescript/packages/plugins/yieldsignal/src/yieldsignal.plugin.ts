import { PluginBase, Tool } from "@goat-sdk/core";
import type { Chain } from "@goat-sdk/core";
import { fetchYieldSignal } from "./client";
import { GetYieldSignalParameters } from "./parameters";

class YieldSignalToolset {
    @Tool({
        name: "get_yield_signal",
        description:
            "Real-time risk-weighted yield signal: ETH liquid staking APY on Ethereum mainnet (Lido, Rocket Pool, Coinbase Wrapped Staked ETH, Frax Ether, Binance Staked ETH), or USDC/WETH lending APY on Base (Aave, Compound, Morpho, Moonwell, Euler, Fluid). Every protocol is compared on one basis (base interest plus incentives) and the response says which protocols could not be read. Costs $0.01 USDC per call via x402; per-asset accuracy is free at /accuracy.json.",
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
