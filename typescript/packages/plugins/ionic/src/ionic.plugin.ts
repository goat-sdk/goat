import { type Chain, PluginBase } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { mode } from "viem/chains";
import { base } from "viem/chains";
import { optimism } from "viem/chains";
import { IonicService } from "./ionic.service";

interface IonicPluginOptions {
    supportedTokens?: string[]; // Optional list of tokens to support
}

export class IonicPlugin extends PluginBase<EVMWalletClient> {
    constructor({ supportedTokens }: IonicPluginOptions = {}) {
        super("ionic", [new IonicService(supportedTokens)]);
    }

    supportsChain(chain: Chain): boolean {
        return chain.type === "evm" && (chain.id === mode.id || chain.id === base.id || chain.id === optimism.id);
    }
}

export function ionic(options: IonicPluginOptions = {}) {
    return new IonicPlugin(options);
}
