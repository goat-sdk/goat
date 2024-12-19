import { type Chain, PluginBase, ToolBase } from "@goat-sdk/core";
import type { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { mode, base, bsc, arbitrum, linea } from "viem/chains";
import { ChainSpecifications } from "./types/ChainSpecifications";
import { RenzoService } from "./renzo.service";

export type RenzoPluginCtorParams = {
    chainSpecifications: ChainSpecifications;
};

const SUPPORTED_CHAINS = [mode, base, arbitrum, bsc, linea];

export class RenzoPlugin extends PluginBase<EVMWalletClient> {
    private chainSpecifications: ChainSpecifications;
    constructor(params: RenzoPluginCtorParams) {
        super("renzo", [new RenzoService(params.chainSpecifications)]);
        this.chainSpecifications = params.chainSpecifications;
    }

    supportsChain = (chain: Chain) =>
        chain.type === "evm" && SUPPORTED_CHAINS.some((c) => c.id === chain.id);
}

export const renzo = ({ chainSpecifications }: RenzoPluginCtorParams) =>
    new RenzoPlugin({ chainSpecifications });
