import type { Plugin, SolanaWalletClient } from "@goat-sdk/core";
import { createJupiterApiClient } from "@jup-ag/api";
import type { z } from "zod";
import { getQuoteParametersSchema, quoteResponseSchema } from "./parameters";

export function jupiter(): Plugin<SolanaWalletClient> {
    return {
        name: "jupiter",
        supportsSmartWallets: () => false,
        supportsChain: (chain) => chain.type === "solana",
        getTools: async () => {
            return [
                {
                    name: "get_quote",
                    description: "This {{tool}} gets a quote for a swap on the Jupiter DEX.",
                    parameters: getQuoteParametersSchema,
                    method: (walletClient, parameters: z.infer<typeof getQuoteParametersSchema>) =>
                        createJupiterApiClient().quoteGet(parameters),
                },
                {
                    name: "get_swap_transaction",
                    description: "This {{tool}} returns a transaction to swap tokens on the Jupiter DEX.",
                    parameters: quoteResponseSchema,
                    method: (walletClient, parameters: z.infer<typeof quoteResponseSchema>) =>
                        createJupiterApiClient().swapPost({
                            swapRequest: {
                                userPublicKey: walletClient.getAddress(),
                                quoteResponse: parameters,
                            },
                        }),
                },
            ];
        },
    };
}
