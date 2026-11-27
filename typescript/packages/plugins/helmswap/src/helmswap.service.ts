import { Tool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { HelmswapApi, type UnsignedEvmTx } from "./api";
import { EvmQuoteParameters } from "./parameters";

export class HelmswapService {
    constructor(private readonly api: HelmswapApi) {}

    @Tool({
        name: "helmswap_get_quote",
        description:
            "Get a HelmSwap swap quote on the wallet's current EVM chain. Returns the expected output, minimum output after slippage, price impact and the disclosed fee. Amounts are in base units.",
    })
    async getQuote(walletClient: EVMWalletClient, parameters: EvmQuoteParameters) {
        // biome-ignore lint/correctness/noUnusedVariables: the ticket is only needed to build a transaction
        const { quoteTicket, ...quote } = await this.fetchQuote(walletClient, parameters);
        return quote;
    }

    @Tool({
        name: "helmswap_swap",
        description:
            "Swap tokens on the wallet's current EVM chain using HelmSwap. HelmSwap builds an unsigned transaction (plus an exact-amount ERC-20 approval when needed) and this wallet signs and sends it. A disclosed fee is included in the quote. Amounts are in base units.",
    })
    async swap(walletClient: EVMWalletClient, parameters: EvmQuoteParameters) {
        const chainId = walletClient.getChain().id;
        const quote = await this.fetchQuote(walletClient, parameters);

        if (quote.priceImpact && quote.priceImpact.buildable === false) {
            throw new Error(
                `HelmSwap will not build this swap because the price impact is too high (${quote.priceImpact.priceImpactPct}%). Try a smaller amount.`,
            );
        }

        const built = await this.api.buildTx({
            chainId,
            tokenIn: parameters.tokenIn,
            tokenOut: parameters.tokenOut,
            amountIn: parameters.amountIn,
            recipient: walletClient.getAddress(),
            quoteTicket: quote.quoteTicket,
            ...(parameters.slippageBps !== undefined && { slippageBps: parameters.slippageBps }),
        });

        const approvalHashes: string[] = [];
        for (const approval of (built.approvals ?? []) as UnsignedEvmTx[]) {
            const { hash } = await walletClient.sendTransaction(toEvmTransaction(approval));
            approvalHashes.push(hash);
        }

        const { hash } = await walletClient.sendTransaction(toEvmTransaction(built.tx as UnsignedEvmTx));

        return {
            hash,
            approvalHashes,
            chainId,
            amountIn: parameters.amountIn,
            expectedOut: quote.quote?.netOutAmount,
            minOut: quote.quote?.minOutNet,
            fee: built.fee ?? quote.quote?.fee,
        };
    }

    private async fetchQuote(walletClient: EVMWalletClient, parameters: EvmQuoteParameters) {
        return this.api.quote({
            chainId: walletClient.getChain().id,
            tokenIn: parameters.tokenIn,
            tokenOut: parameters.tokenOut,
            amountIn: parameters.amountIn,
            slippageBps: parameters.slippageBps,
        });
    }
}

function toEvmTransaction(tx: UnsignedEvmTx) {
    return {
        to: tx.to,
        data: tx.data,
        value: BigInt(tx.value ?? "0"),
    };
}
