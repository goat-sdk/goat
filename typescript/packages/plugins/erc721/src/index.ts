import type { Chain, EVMWalletClient, Plugin } from "@goat-sdk/core";
import { BAYC, CRYPTOPUNKS, type Token, getTokensForNetwork } from "./token";
import { getTools } from "./tools";

export { BAYC, CRYPTOPUNKS };
export type { Token };

export type ERC721Options = {
    tokens: Token[];
};

export function erc721({ tokens }: ERC721Options): Plugin<EVMWalletClient> {
    return {
        name: "ERC721",
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
