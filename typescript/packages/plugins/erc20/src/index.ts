import type { Chain, EVMWalletClient, Plugin } from "@goat-sdk/core";
import { PEPE, type Token, USDC, getTokensForNetwork } from "./token";
import { getTools } from "./tools";

export type { Token };
export { USDC, PEPE };

export type ERC20Options = {
    tokens: Token[];
};

export function erc20({ tokens }: ERC20Options): Plugin<EVMWalletClient> {
    return {
        name: "ERC20",
        supportsChain: (chain: Chain) => chain.type === "evm",
        supportsSmartWallets: () => true,
        getTools: async (walletClient: EVMWalletClient) => {
            const network = walletClient.getChain();

            if (!network.id) {
                throw new Error("Network ID is required");
            }

            const tokenList = getTokensForNetwork(network.id, tokens);
            return getTools(walletClient, tokenList);
        },
    };
}
