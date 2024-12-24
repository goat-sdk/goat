import { type Chain, PluginBase } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { IonicTools } from "./ionic.service";

export interface IonicPluginOptions {
    supportedTokens?: string[]; // Optional list of tokens to support (can be used for filtering or UI hints)
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