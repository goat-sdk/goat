import { Tool } from "@goat-sdk/core";
import { SolanaWalletClient } from "@goat-sdk/wallet-solana";
import type { HelmswapApi } from "./api";
import { SolanaQuoteParameters } from "./parameters";

export class HelmswapSolanaService {
    constructor(private readonly api: HelmswapApi) {}

    @Tool({
        name: "helmswap_solana_get_quote",
        description:
            "Get a HelmSwap swap quote on Solana. Returns the expected output, minimum output after slippage and the disclosed fee. Amounts are in base units.",
    })
    async getQuote(walletClient: SolanaWalletClient, parameters: SolanaQuoteParameters) {
        // biome-ignore lint/correctness/noUnusedVariables: the ticket is only needed to build a transaction
        const { quoteTicket, ...quote } = await this.fetchQuote(parameters);
        return quote;
    }

    @Tool({
        name: "helmswap_solana_swap",
        description:
            "Swap tokens on Solana using HelmSwap. HelmSwap builds an unsigned transaction and this wallet signs and sends it. A disclosed fee is included in the quote. Amounts are in base units.",
    })
    async swap(walletClient: SolanaWalletClient, parameters: SolanaQuoteParameters) {
        if (!this.api.hasApiKey) {
            throw new Error(
                "Building Solana swaps needs a free HelmSwap API key. Create one at https://helmswap.com/developers and pass it as helmswapSolana({ apiKey }).",
            );
        }

        const quote = await this.fetchQuote(parameters);

        const built = await this.api.buildTx({
            chain: "solana",
            inputMint: parameters.inputMint,
            outputMint: parameters.outputMint,
            amount: parameters.amount,
            user: walletClient.getAddress(),
            quoteTicket: quote.quoteTicket,
            ...(parameters.slippageBps !== undefined && { slippageBps: parameters.slippageBps }),
        });

        const transactionBase64: string | undefined = built.tx?.transactionBase64;
        if (!transactionBase64) {
            throw new Error("HelmSwap did not return a Solana transaction");
        }

        // Sign the transaction exactly as built so its instructions (including the disclosed fee transfer) stay intact.
        const { hash } = await walletClient.sendRawTransaction(transactionBase64);

        return {
            hash,
            amount: parameters.amount,
            expectedOut: quote.quote?.netOutAmount,
            minOut: quote.quote?.minNetOutAmount,
            fee: quote.quote?.fee,
        };
    }

    private async fetchQuote(parameters: SolanaQuoteParameters) {
        return this.api.quote({
            chain: "solana",
            inputMint: parameters.inputMint,
            outputMint: parameters.outputMint,
            amount: parameters.amount,
            slippageBps: parameters.slippageBps,
        });
    }
}
