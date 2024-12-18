import { Tool } from "@goat-sdk/core";
import { CheckApprovalBodySchema, GetQuoteBodySchema, GetSwapBodySchema } from "./parameters";
import type { UniswapCtorParams } from "./types/UniswapCtorParams";

export class UniswapService {
    constructor(private readonly params: UniswapCtorParams) {}

    @Tool({
        description:
            "Check if the wallet has enough approval for a token and return the transaction to approve the token. The approval must takes place before the swap transaction.",
    })
    async checkApproval(parameters: CheckApprovalBodySchema) {
        const url = new URL(`${this.params.baseUrl}/check_approval`);

        const response = await fetch(url.toString(), {
            method: "POST",
            body: JSON.stringify(parameters),
            headers: {
                "x-api-key": this.params.apiKey,
            },
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch approval: ${response.statusText}`);
        }

        return await response.json();
    }

    @Tool({
        description:
            "Get the quote for a swap. If permitData is returned, it needs to be signed using the signedTypedData tool.",
    })
    async getQuote(parameters: GetQuoteBodySchema) {
        const url = new URL(`${this.params.baseUrl}/quote`);

        const response = await fetch(url.toString(), {
            method: "POST",
            body: JSON.stringify(parameters),
            headers: {
                "x-api-key": this.params.apiKey,
            },
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch quote: ${response.statusText}`);
        }

        return await response.json();
    }

    @Tool({
        description:
            "Get the swap transaction for a swap. If permitData was returned from the get_quote tool, it needs to be signed using the signedTypedData tool before calling this function.",
    })
    async getSwapTransaction(parameters: GetSwapBodySchema) {
        const url = new URL(`${this.params.baseUrl}/swap`);

        const response = await fetch(url.toString(), {
            method: "POST",
            body: JSON.stringify(parameters),
            headers: {
                "x-api-key": this.params.apiKey,
            },
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch swap: ${response.statusText}`);
        }

        return await response.json();
    }
}
