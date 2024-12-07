import type { DeferredTool, EVMWalletClient } from "@goat-sdk/core";
import type { z } from "zod";
import { getQuote, getSwapTransaction, sendSwapTransaction } from "./api";
import { GetQuoteBodySchema, GetSwapBodySchema, SendSwapBodySchema } from "./types";

export type UniswapToolsOptions = {
    apiKey: string;
    baseUrl: string;
};

export function getTools({ apiKey, baseUrl }: UniswapToolsOptions): DeferredTool<EVMWalletClient>[] {
    return [
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
            parameters: SendSwapBodySchema,
            method: async (walletClient: EVMWalletClient, parameters: z.infer<typeof SendSwapBodySchema>) => {
                return sendSwapTransaction(parameters, walletClient);
            },
        },
    ];
}
