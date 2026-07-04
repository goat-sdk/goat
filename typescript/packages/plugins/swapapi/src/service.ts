import { Tool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { SwapQuoteParameters, ExecuteSwapParameters } from "./parameters";
import { SwapAPIServiceParams, SwapAPIQuoteResponse } from "./types";

export class SwapAPIService {
    private readonly baseUrl: string;

    constructor(params: SwapAPIServiceParams = {}) {
        this.baseUrl = params.baseUrl ?? "https://api.swapapi.dev";
    }

    @Tool({
        name: "swapapi_get_swap_quote",
        description:
            "Get a swap quote from SwapAPI DEX aggregator. Returns executable calldata for token swaps across 46 EVM chains. No API key required.",
    })
    async getSwapQuote(
        walletClient: EVMWalletClient,
        parameters: SwapQuoteParameters,
    ): Promise<SwapAPIQuoteResponse> {
        const chainId = walletClient.getChain().id;
        const sender = walletClient.getAddress();

        const url = new URL(`${this.baseUrl}/v1/swap/${chainId}`);
        url.searchParams.append("tokenIn", parameters.tokenIn);
        url.searchParams.append("tokenOut", parameters.tokenOut);
        url.searchParams.append("amount", parameters.amount);
        url.searchParams.append("sender", sender);
        if (parameters.maxSlippage !== undefined) {
            url.searchParams.append("maxSlippage", String(parameters.maxSlippage));
        }

        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error(`SwapAPI request failed: ${response.statusText}`);
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(`SwapAPI error: ${JSON.stringify(result.error)}`);
        }

        if (result.data.status === "NoRoute") {
            throw new Error("No swap route found for this token pair");
        }

        return result.data;
    }

    @Tool({
        name: "swapapi_execute_swap",
        description:
            "Execute a token swap via SwapAPI. Fetches a fresh quote and submits the transaction. For ERC-20 inputs, ensure the token is approved for the router address first.",
    })
    async executeSwap(walletClient: EVMWalletClient, parameters: ExecuteSwapParameters) {
        const chainId = walletClient.getChain().id;
        const sender = walletClient.getAddress();

        const url = new URL(`${this.baseUrl}/v1/swap/${chainId}`);
        url.searchParams.append("tokenIn", parameters.tokenIn);
        url.searchParams.append("tokenOut", parameters.tokenOut);
        url.searchParams.append("amount", parameters.amount);
        url.searchParams.append("sender", sender);
        if (parameters.maxSlippage !== undefined) {
            url.searchParams.append("maxSlippage", String(parameters.maxSlippage));
        }

        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error(`SwapAPI request failed: ${response.statusText}`);
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(`SwapAPI error: ${JSON.stringify(result.error)}`);
        }

        if (result.data.status === "NoRoute") {
            throw new Error("No swap route found for this token pair");
        }

        const { tx } = result.data;

        const txResult = await walletClient.sendTransaction({
            to: tx.to,
            data: tx.data,
            value: BigInt(tx.value),
        });

        return {
            hash: txResult.hash,
            status: result.data.status,
            amountIn: result.data.amountIn,
            expectedAmountOut: result.data.expectedAmountOut,
            priceImpact: result.data.priceImpact,
        };
    }
}
