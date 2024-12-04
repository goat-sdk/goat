import type { DeferredTool, EVMWalletClient } from "@goat-sdk/core";
import type { z } from "zod";
import { getQuoteBodySchema } from "./parameters";
import { getQuote } from "./api";

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
	];
}
