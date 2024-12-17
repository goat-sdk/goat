import { type Chain, PluginBase } from "@goat-sdk/core";
import type { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { type Token, getTokensForNetwork } from "./token";
import { getTools } from "./tools";

export type ERC20PluginCtorParams = {
    tokens: Token[];
};

export class ERC20Plugin extends PluginBase<EVMWalletClient> {
    private tokens: Token[];
    constructor({ tokens }: ERC20PluginCtorParams) {
        super("erc20", []);
        this.tokens = tokens;
    }

    supportsChain = (chain: Chain) => chain.type === "evm";

    getTools(walletClient: EVMWalletClient) {
        const network = walletClient.getChain();

        if (!network.id) {
            throw new Error("Network ID is required");
        }

        const tokenList = getTokensForNetwork(network.id, this.tokens);
        return getTools(walletClient, tokenList);
    }
}

export function erc20({ tokens }: ERC20PluginCtorParams) {
    return new ERC20Plugin({ tokens });
}
