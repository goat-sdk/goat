import { IroncladService } from "./ironclad.service";
import { type Chain, PluginBase, ToolBase } from "@goat-sdk/core";
import { mode } from "viem/chains";
import type { EVMWalletClient } from "@goat-sdk/wallet-evm";

const SUPPORTED_CHAINS = [mode];

export class IronCladPlugin extends PluginBase<EVMWalletClient> {
    constructor() {
        super("ironclad", [new IroncladService()]);
    }

    supportsChain = (chain: Chain) =>
        chain.type === "evm" && SUPPORTED_CHAINS.some((c) => c.id === chain.id);
}

export const ironclad = () => new IronCladPlugin();
