import type { Plugin, SolanaWalletClient } from "@goat-sdk/core";
import { createJupiterApiClient } from "@jup-ag/api";
import { TransactionMessage, VersionedTransaction } from "@solana/web3.js";
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
                    method: async (walletClient, parameters: z.infer<typeof quoteResponseSchema>) => {
                        const response = await createJupiterApiClient().swapPost({
                            swapRequest: {
                                userPublicKey: walletClient.getAddress(),
                                quoteResponse: parameters,
                            },
                        });

                        const serializedTransaction = response.swapTransaction;
                        const deserializedTransaction = VersionedTransaction.deserialize(
                            Buffer.from(serializedTransaction, "base64"),
                        );
                        const instructions = TransactionMessage.decompile(deserializedTransaction.message).instructions;

                        return {
                            serializedTransaction,
                            instructions,
                            lastValidBlockHeight: response.lastValidBlockHeight,
                            prioritizationFeeLamports: response.prioritizationFeeLamports,
                            dynamicSlippageReport: response.dynamicSlippageReport,
                        };
                    },
                },
            ];
        },
    };
}
