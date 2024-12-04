import type { DeferredTool, EVMWalletClient } from "@goat-sdk/core";
import type { z } from "zod";

import type { ApiKeyCredentials } from "./api";
import { getQuoteParametersSchema } from "./parameters";

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
			parameters: getQuoteParametersSchema,
			method: async (
				walletClient: EVMWalletClient,
				parameters: z.infer<typeof getQuoteParametersSchema>,
			) => {
				return getQuote(parameters);
			},
		},
	];
}
