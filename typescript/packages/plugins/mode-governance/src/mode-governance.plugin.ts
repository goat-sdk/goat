import { type Chain, PluginBase } from "@goat-sdk/core";
import type { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { MODE_CHAIN_ID } from "./types";
import { getTools } from "./mode-governance.service";

export class ModeGovernancePlugin extends PluginBase<EVMWalletClient> {
    constructor() {
        super("modeGovernance", []);
    }

    supportsChain = (chain: Chain) => chain.type === "evm" && chain.id === MODE_CHAIN_ID;

    getTools(walletClient: EVMWalletClient) {
        return getTools(walletClient);
    }
}

export const modeGovernance = () => new ModeGovernancePlugin();