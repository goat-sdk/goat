import type { Chain } from "viem/chains";
import type { z } from "zod";
import type { getQuoteParametersSchema } from "./parameters";
import { mustBeDefined } from "./utils";

const GAMMA_URL = "https://gamma-api.polymarket.com";

function getBaseUrl(): string {
	return mustBeDefined(process.env.UNISWAP_BASE_URL);
}

export type ApiKeyCredentials = {
	key: string;
};

export async function getQuote(
	parameters: z.infer<typeof getQuoteParametersSchema>,
	// biome-ignore lint/suspicious/noExplicitAny: Need to create a schema for the response
): Promise<any> {
	const url = new URL(`${getBaseUrl()}/quote`);

	const response = await fetch(url.toString());
	if (!response.ok) {
		throw new Error(`Failed to fetch events: ${response.statusText}`);
	}

	return await response.json();
}
