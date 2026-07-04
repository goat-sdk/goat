import { PluginBase } from "@goat-sdk/core";
import { Chain } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { SwapAPIService } from "./service";

export type SwapAPICtorParams = {
    baseUrl?: string;
};

export class SwapAPIPlugin extends PluginBase<EVMWalletClient> {
    constructor(params: SwapAPICtorParams = {}) {
        super("swapapi", [new SwapAPIService(params)]);
    }

    supportsChain = (chain: Chain) => chain.type === "evm";
}

export function swapapi(params: SwapAPICtorParams = {}) {
    return new SwapAPIPlugin(params);
}
