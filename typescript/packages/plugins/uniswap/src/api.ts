import type { EVMWalletClient } from "@goat-sdk/core";
import type { z } from "zod";
import type { GetQuoteBodySchema, GetSwapBodySchema, SendSwapBodySchema } from "./types";

export async function getQuote(
    parameters: z.infer<typeof GetQuoteBodySchema>,
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
    parameters: z.infer<typeof GetSwapBodySchema>,
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
    transaction: z.infer<typeof SendSwapBodySchema>,
    walletClient: EVMWalletClient,
): Promise<any> {
    const txHash = await walletClient.sendTransaction(transaction);
    return txHash.hash;
}
