// ionic.plugin.ts
import { PluginBase } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { Chain } from "@goat-sdk/core";
import { IonicService } from "./ionic.service";

export class IonicPlugin extends PluginBase<EVMWalletClient> {
    constructor() {
        
        super("ionic", [new IonicService()]);
    }

   
    supportsChain = (chain: Chain) => chain.type === "evm";
}


export const ionicPlugin = () => new IonicPlugin();
