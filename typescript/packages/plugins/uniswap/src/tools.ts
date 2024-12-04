import type { DeferredTool, EVMWalletClient } from "@goat-sdk/core";
import type { z } from "zod";
import { getQuoteBodySchema, getSwapBodySchema } from "./parameters";
import { getQuote, getSwapTransaction } from "./api";

export type UniswapToolsOptions = {
	apiKey: string;
	baseUrl: string;
};

export function getTools({
	apiKey,
	baseUrl,
}: UniswapToolsOptions): DeferredTool<EVMWalletClient>[] {
	return [
		{
			name: "get_uniswap_quote",
			description: "This {{tool}} gets the quotei for a Uniswap swap",
			parameters: getQuoteBodySchema,
			method: async (parameters: z.infer<typeof getQuoteBodySchema>) => {
				return getQuote(parameters, apiKey, baseUrl);
			},
		},
		{
			name: "get_uniswap_swap",
			description: "This {{tool}} gets the swap for a Uniswap swap",
			parameters: getSwapBodySchema,
			method: async (parameters: z.infer<typeof getSwapBodySchema>) => {
				return getSwapTransaction(parameters, apiKey, baseUrl);
			},
		}
	];
}
