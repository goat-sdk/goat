import type { DeferredTool, EVMWalletClient } from "@goat-sdk/core";
import type { z } from "zod";

import type { ApiKeyCredentials } from "./api";
import { getQuoteBodySchema } from "./parameters";

import { getQuote } from "./api";

export type UniswapToolsOptions = {
	credentials: ApiKeyCredentials;
};

export function getTools({
	credentials,
}: UniswapToolsOptions): DeferredTool<EVMWalletClient>[] {
	return [
		{
			name: "get_uniswap_quote",
			description: "This {{tool}} gets the quotei for a Uniswap swap",
			parameters: getQuoteBodySchema,
			method: async (
				walletClient: EVMWalletClient,
				parameters: z.infer<typeof getQuoteBodySchema>,
			) => {
				return getQuote(parameters);
			},
		},
	];
}
