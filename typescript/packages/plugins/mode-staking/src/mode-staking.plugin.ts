import { type Chain, PluginBase } from "@goat-sdk/core";
import type { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { MODE_CHAIN_ID } from "./types";
import { getTools } from "./mode-staking.service";

export class ModeStakingPlugin extends PluginBase<EVMWalletClient> {
    constructor() {
        super("modeStaking", []);
    }

    supportsChain = (chain: Chain) => chain.type === "evm" && chain.id === MODE_CHAIN_ID;

    getTools(walletClient: EVMWalletClient) {
        return getTools(walletClient);
    }
}

export const modeStaking = () => new ModeStakingPlugin();