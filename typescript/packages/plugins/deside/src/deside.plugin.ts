import { PluginBase } from "@goat-sdk/core";
import { SolanaWalletClient } from "@goat-sdk/wallet-solana";
import { DesideService } from "./deside.service";
import { DesidePluginOptions } from "./types";

export class DesidePlugin extends PluginBase<SolanaWalletClient> {
    constructor(options: DesidePluginOptions) {
        super("deside", [new DesideService(options)]);
    }

    supportsChain = (chain: { type: string }) => chain.type === "solana";
}

export function deside(options: DesidePluginOptions) {
    return new DesidePlugin(options);
}
