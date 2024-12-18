import { type Chain, PluginBase } from "@goat-sdk/core";
import { mode } from "viem/chains";
import type { KimCtorParams, KimContractAddresses } from "./types/KimCtorParams";

const SUPPORTED_CHAINS = [mode];
export class KimPlugin extends PluginBase {
    private readonly addresses: KimContractAddresses;
    constructor(params: KimCtorParams) {
        super("kim", []);
        this.addresses = params.addresses;
    }

    supportsChain = (chain: Chain) => chain.type === "evm" && SUPPORTED_CHAINS.some((c) => c.id === chain.id);
}

export const kim = (params: KimCtorParams) => new KimPlugin(params);
