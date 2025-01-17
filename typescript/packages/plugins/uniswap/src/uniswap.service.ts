import { Tool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { CheckApprovalBodySchema, GetQuoteParameters } from "./parameters";
import type { UniswapCtorParams } from "./types/UniswapCtorParams";

export class UniswapService {
    constructor(private readonly params: UniswapCtorParams) {}

    private async makeRequest(endpoint: string, parameters: unknown) {
        const url = new URL(`${this.params.baseUrl}/${endpoint}`);

        const response = await fetch(url.toString(), {
            method: "POST",
            body: JSON.stringify(parameters),
            headers: {
                "x-api-key": this.params.apiKey,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch ${endpoint}: ${JSON.stringify(await response.json(), null, 2)}`);
        }

        return response.json();
    }

    @Tool({
        name: "uniswap_check_approval",
        description:
            "Check if the wallet has enough approval for a token and return the transaction to approve the token. The approval must takes place before the swap transaction",
    })
    async checkApproval(walletClient: EVMWalletClient, parameters: CheckApprovalBodySchema) {
        const data = await this.makeRequest("check_approval", {
            token: parameters.token,
            amount: parameters.amount,
            walletAddress: parameters.walletAddress,
            chainId: walletClient.getChain().id,
        });

        const approval = data.approval;

        if (!approval) {
            return {
                status: "approved",
            };
        }

        const transaction = await walletClient.sendTransaction({
            to: approval.to,
            value: approval.value,
            data: approval.data,
        });

        return {
            status: "approved",
            txHash: transaction.hash,
        };
    }

    @Tool({
        name: "uniswap_get_quote",
        description: "Get the quote for a swap",
    })
    async getQuote(walletClient: EVMWalletClient, parameters: GetQuoteParameters) {
        return this.makeRequest("quote", {
            ...parameters,
            swapper: walletClient.getAddress(),
        });
    }

    @Tool({
        name: "uniswap_swap_tokens",
        description: "Swap tokens on Uniswap",
    })
    async getSwapTransaction(walletClient: EVMWalletClient, parameters: GetQuoteParameters) {
        const quote = await this.getQuote(walletClient, parameters);

        const response = await this.makeRequest("swap", {
            quote: quote.quote,
        });

        const swap = response.swap;

        const transaction = await walletClient.sendTransaction({
            to: swap.to,
            value: swap.value,
            data: swap.data,
        });

        return {
            txHash: transaction.hash,
        };
    }
}
