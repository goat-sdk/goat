import type { Plugin, SolanaWalletClient } from "@goat-sdk/core";
import { createJupiterApiClient } from "@jup-ag/api";
import { ComputeBudgetProgram, type Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import type { z } from "zod";
import { getQuoteParametersSchema } from "./parameters";

export function jupiter({
    connection,
}: {
    connection: Connection;
}): Plugin<SolanaWalletClient> {
    return {
        name: "jupiter",
        supportsSmartWallets: () => false,
        supportsChain: (chain) => chain.type === "solana",
        getTools: async (walletClient) => {
            return [
                {
                    name: "get_quote",
                    description: "This {{tool}} gets a quote for a swap on the Jupiter DEX.",
                    parameters: getQuoteParametersSchema,
                    method: async (parameters: z.infer<typeof getQuoteParametersSchema>) => {
                        // get the token info
                        try {
                            const response = await createJupiterApiClient().quoteGet(parameters);

                            console.log(JSON.stringify(response, null, 2));
                            return response;
                        } catch (error: unknown) {
                            if (error && typeof error === "object" && "response" in error) {
                                const response = error.response as Response;

                                const result = await response.json();
                                console.error(result);
                                throw new Error(`Failed to get quote: ${result.error}`);
                            }
                            throw error;
                        }
                    },
                },
                {
                    name: "swap_tokens",
                    description: "This {{tool}} swaps tokens on the Jupiter DEX",
                    parameters: getQuoteParametersSchema,
                    method: async (parameters: z.infer<typeof getQuoteParametersSchema>) => {
                        const jupiterApiClient = createJupiterApiClient();
                        const quoteResponse = await jupiterApiClient.quoteGet(parameters);
                        const { swapInstruction, addressLookupTableAddresses } =
                            await jupiterApiClient.swapInstructionsPost({
                                swapRequest: {
                                    userPublicKey: walletClient.getAddress(),
                                    quoteResponse: quoteResponse,
                                },
                            });

                        const deserializedInstruction = new TransactionInstruction({
                            programId: new PublicKey(swapInstruction.programId),
                            keys: swapInstruction.accounts.map((key) => ({
                                pubkey: new PublicKey(key.pubkey),
                                isSigner: key.isSigner,
                                isWritable: key.isWritable,
                            })),
                            data: Buffer.from(swapInstruction.data, "base64"),
                        });

                        // TODO: Make this dynamic?
                        const computeBudgetIx = ComputeBudgetProgram.setComputeUnitLimit({
                            units: 400000, // Adjust this value as needed
                        });

                        const { hash } = await walletClient.sendTransaction({
                            instructions: [computeBudgetIx, deserializedInstruction],
                            addressLookupTableAddresses,
                        });

                        return {
                            hash,
                        };
                    },
                },
            ];
        },
    };
}
