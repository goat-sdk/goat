import type { z } from "zod";
import type { getQuoteBodySchema, getSwapBodySchema } from "./parameters";

export async function getQuote(
	parameters: z.infer<typeof getQuoteBodySchema>,
	// biome-ignore lint/suspicious/noExplicitAny: Need to create a schema for the response
	apiKey: string,
	baseUrl: string,
): Promise<any> {
	const url = new URL(`${baseUrl}/quote`);

	const response = await fetch(url.toString(), {
		method: "POST",
		body: JSON.stringify(parameters),
		headers: {
			"x-api-key": apiKey,
		},
	});
	if (!response.ok) {
		throw new Error(`Failed to fetch quote: ${response.statusText}`);
	}

	return await response.json();
}

export async function getSwapTransaction(
	parameters: z.infer<typeof getSwapBodySchema>,
	// biome-ignore lint/suspicious/noExplicitAny: Need to create a schema for the response
	apiKey: string,
	baseUrl: string,
): Promise<any> {
	const url = new URL(`${baseUrl}/swap`);

	const response = await fetch(url.toString(), {
		method: "POST",
		body: JSON.stringify(parameters),
		headers: {
			"x-api-key": apiKey,
		},
	});
	if (!response.ok) {
		throw new Error(`Failed to fetch swap: ${response.statusText}`);
	}

	return await response.json();
}

export async function sendSwapTransaction(
	transaction: z.infer<typeof getSwapBodySchema>,
	walletClient: EVMWalletClient,
	// biome-ignore lint/suspicious/noExplicitAny: Need to create a schema for the response
	apiKey: string,
	baseUrl: string,
) {
	

}