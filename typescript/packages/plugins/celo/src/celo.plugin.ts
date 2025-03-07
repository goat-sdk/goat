import { type Chain, PluginBase } from "@goat-sdk/core";
import type { ViemEVMWalletClient } from "@goat-sdk/wallet-viem";
import { CeloService } from "./celo.service";
import { type Token } from "./token";

export type CeloPluginCtorParams = {
    tokens: Token[];
};

export class CeloPlugin extends PluginBase<ViemEVMWalletClient> {
    constructor({ tokens }: CeloPluginCtorParams) {
        super("celo", [new CeloService({ tokens })]);
    }

    supportsChain = (chain: Chain) => chain.type === "evm";
}

export function celoPlugin({ tokens }: CeloPluginCtorParams) {
    return new CeloPlugin({ tokens });
}
