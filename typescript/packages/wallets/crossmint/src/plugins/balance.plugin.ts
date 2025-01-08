import type { CrossmintApiClient } from "@crossmint/common-sdk-base";
import { Chain, PluginBase, WalletClientBase } from "@goat-sdk/core";
import { TokenBalanceService } from "./balance.service";

export class BalancePlugin extends PluginBase<WalletClientBase> {
    constructor(client: CrossmintApiClient) {
        super("balance", [new TokenBalanceService(client)]);
    }

    supportsChain(chain: Chain) {
        return chain.type === "evm" || chain.type === "solana" || chain.type === "sui" || chain.type === "aptos";
    }
}

export function balancePlugin(client: CrossmintApiClient) {
    return () => {
        return new BalancePlugin(client);
    };
}
