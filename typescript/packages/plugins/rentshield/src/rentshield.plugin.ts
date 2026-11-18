import { type Chain, PluginBase, type WalletClientBase } from "@goat-sdk/core";
import { type RentShieldOptions, RentShieldService } from "./rentshield.service";

export class RentShieldPlugin extends PluginBase<WalletClientBase> {
    constructor(options: RentShieldOptions = {}) {
        super("rentshield", [new RentShieldService(options)]);
    }

    supportsChain = (chain: Chain) => chain.type === "solana";
}

export function rentshield(options: RentShieldOptions = {}) {
    return new RentShieldPlugin(options);
}
