// typescript/packages/plugins/ionic/src/ionic.plugin.ts
import { type Chain, PluginBase } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { IonicTools } from "./ionic.service"; // Correct import: IonicTools

export interface IonicPluginOptions {
    supportedTokens?: string[]; // Optional list of tokens to support
}

export class IonicPlugin extends PluginBase<EVMWalletClient> {
    constructor(options?: IonicPluginOptions) { // Accept options in constructor
        super("ionic", [new IonicTools()]); // Correct instantiation: IonicTools
    }

    supportsChain = (chain: Chain) => chain.type === "evm";
}

export function ionic(options?: IonicPluginOptions) { // Make options optional here as well if needed
    return new IonicPlugin(options); // Pass options to the constructor
}