import { Chain, PluginBase } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { SwapChanOptions, SwapChanService } from "./swapchan.service";

const supportedChains = [1, 10, 56, 137, 8453, 42161, 43114, 59144, 534352];

export class SwapChanPlugin extends PluginBase<EVMWalletClient> {
    constructor(options: SwapChanOptions = {}) {
        super("swapchan", [new SwapChanService(options)]);
    }

    supportsChain = (chain: Chain) => chain.type === "evm" && supportedChains.includes(chain.id);
}

export function swapchan(options: SwapChanOptions = {}) {
    return new SwapChanPlugin(options);
}
