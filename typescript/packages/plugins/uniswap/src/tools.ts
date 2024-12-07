import type { DeferredTool, EVMWalletClient } from "@goat-sdk/core";
import type { z } from "zod";
import { getApprovalTransaction, getQuote, getSwapTransaction, sendTransaction } from "./api";
import { CheckApprovalBodySchema, GetQuoteBodySchema, GetSwapBodySchema, SendTransactionBodySchema } from "./types";

export type UniswapToolsOptions = {
    apiKey: string;
    baseUrl: string;
};

export function getTools({ apiKey, baseUrl }: UniswapToolsOptions): DeferredTool<EVMWalletClient>[] {
    return [
        {
            name: "check_approval",
            description: "This {{tool}} checks if the wallet has enough approval for a token",
            parameters: CheckApprovalBodySchema,
            method: async (walletClient: EVMWalletClient, parameters: z.infer<typeof CheckApprovalBodySchema>) => {
                return getApprovalTransaction(parameters, apiKey, baseUrl);
            },
        },
        {
            name: "get_quote",
            description: "This {{tool}} gets the quote for a swap",
            parameters: GetQuoteBodySchema,
            method: async (walletClient: EVMWalletClient, parameters: z.infer<typeof GetQuoteBodySchema>) => {
                return getQuote(parameters, apiKey, baseUrl);
            },
        },
        {
            name: "get_swap_transaction",
            description: "This {{tool}} gets the swap transaction for a swap",
            parameters: GetSwapBodySchema,
            method: async (walletClient: EVMWalletClient, parameters: z.infer<typeof GetSwapBodySchema>) => {
                return getSwapTransaction(parameters, apiKey, baseUrl);
            },
        },
        {
            name: "send_swap_transaction",
            description: "This {{tool}} signs and sends a swap transaction",
            parameters: SendTransactionBodySchema,
            method: async (walletClient: EVMWalletClient, parameters: z.infer<typeof SendTransactionBodySchema>) => {
                return sendTransaction(parameters, walletClient);
            },
        },
    ];
}
