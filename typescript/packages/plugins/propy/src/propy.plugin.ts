import { Chain, PluginBase } from "@goat-sdk/core";
import { PropyService } from "./propy.service";

import { arbitrum, base, baseSepolia, mainnet, sepolia } from "viem/chains";

const SUPPORTED_CHAINS = [mainnet, arbitrum, base, sepolia, baseSepolia];

type PropyPluginOptions = {
    provider?: string;
    chainId?: number;
};

export class PropyPlugin extends PluginBase {
    constructor(options: PropyPluginOptions) {
        super("propy", [new PropyService(options.provider, options.chainId)]);
    }

    supportsChain = (chain: Chain) => chain.type === "evm" && SUPPORTED_CHAINS.some((c) => c.id === chain.id);
}

export function propy({ provider, chainId }: PropyPluginOptions) {
    return new PropyPlugin({ provider, chainId });
}
