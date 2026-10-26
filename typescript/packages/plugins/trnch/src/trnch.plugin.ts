import { Chain, PluginBase } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { TrnchService } from "./trnch.service";

export type TrnchCtorParams = {
    // Optional: without it, a key is created on first use by signing a message with the wallet.
    apiKey?: string;
    // Optional: your TRNCH referral code, you earn a share of the fees of the keys this plugin creates.
    ref?: string;
};

export class TrnchPlugin extends PluginBase<EVMWalletClient> {
    constructor(params: TrnchCtorParams = {}) {
        super("trnch", [new TrnchService(params.apiKey, params.ref)]);
    }

    // Robinhood Chain
    supportsChain = (chain: Chain) => chain.type === "evm" && chain.id === 4663;
}

export function trnch(params: TrnchCtorParams = {}) {
    return new TrnchPlugin(params);
}
