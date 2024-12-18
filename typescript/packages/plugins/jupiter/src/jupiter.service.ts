import { Tool } from "@goat-sdk/core";
import { SolanaWalletClient } from "@goat-sdk/wallet-solana";
import { createJupiterApiClient } from "@jup-ag/api";
import { ComputeBudgetProgram, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { GetQuoteParameters } from "./parameters";

export class JupiterService {
    private readonly jupiterApiClient: ReturnType<typeof createJupiterApiClient>;

    constructor() {
        this.jupiterApiClient = createJupiterApiClient();
    }

    @Tool({
        description: "Get a quote for a swap on the Jupiter DEX",
    })
    async getQuote(parameters: GetQuoteParameters) {
        try {
            const response = this.jupiterApiClient.quoteGet(parameters);
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
    }

    @Tool({
        description: "Swap an SPL token for another token on the Jupiter DEX",
    })
    async swapTokens(walletClient: SolanaWalletClient, parameters: GetQuoteParameters) {
        const quoteResponse = await this.getQuote(parameters);

        const { swapInstruction, addressLookupTableAddresses } = await this.jupiterApiClient.swapInstructionsPost({
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
    }
}
