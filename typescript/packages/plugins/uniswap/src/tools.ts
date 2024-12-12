import type { Tool } from "@goat-sdk/core";
import type { z } from "zod";
import { getApprovalTransaction, getQuote, getSwapTransaction } from "./api";
import { CheckApprovalBodySchema, GetQuoteBodySchema, GetSwapBodySchema } from "./types";

export type UniswapToolsOptions = {
    apiKey: string;
    baseUrl: string;
};

export function getTools({ apiKey, baseUrl }: UniswapToolsOptions): Tool[] {
    return [
        {
            name: "check_approval",
            description:
                "This {{tool}} checks if the wallet has enough approval for a token and returns the transaction to approve the token. The approval must takes place before the swap transaction.",
            parameters: CheckApprovalBodySchema,
            method: async (parameters: z.infer<typeof CheckApprovalBodySchema>) => {
                return getApprovalTransaction(parameters, apiKey, baseUrl);
            },
        },
        {
            name: "get_quote",
            description:
                "This {{tool}} gets the quote for a swap. If permitData is returned, it needs to be signed using the signedTypedData tool.",
            parameters: GetQuoteBodySchema,
            method: async (parameters: z.infer<typeof GetQuoteBodySchema>) => {
                return getQuote(parameters, apiKey, baseUrl);
            },
        },
        {
            name: "get_swap_transaction",
            description:
                "This {{tool}} gets the swap transaction for a swap. If permitData was returned from the get_quote tool, it needs to be signed using the signedTypedData tool before calling this function.",
            parameters: GetSwapBodySchema,
            method: async (parameters: z.infer<typeof GetSwapBodySchema>) => {
                return getSwapTransaction(parameters, apiKey, baseUrl);
            },
        },
    ];
}
