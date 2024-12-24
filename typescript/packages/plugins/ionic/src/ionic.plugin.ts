// typescript/packages/plugins/ionic/src/ionic.plugin.ts
import { type Chain, PluginBase } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { IonicTools } from "./ionic.service";

export interface IonicPluginOptions {
    supportedTokens?: string[];
}

export class IonicPlugin extends PluginBase<EVMWalletClient> {
    constructor(options?: IonicPluginOptions) {
        super("ionic", [new IonicTools()]);
    }

    supportsChain = (chain: Chain) => chain.type === "evm";
}

export function ionic(options?: IonicPluginOptions) {
    return new IonicPlugin(options);
}