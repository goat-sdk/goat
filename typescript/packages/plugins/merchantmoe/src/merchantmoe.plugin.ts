import { Chain, PluginBase } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { MerchantMoeService } from "./merchantmoe.service";

export interface MerchantMoePluginOptions {
    rpcUrl?: string;
}

export class MerchantMoePlugin extends PluginBase<EVMWalletClient> {
    constructor(options?: MerchantMoePluginOptions) {
        super("merchantmoe", [new MerchantMoeService()]);
    }

    supportsChain = (chain: Chain) => chain.type === "evm" && chain.id === 5000; // Mode Mainnet
} 