import type { z } from "zod";
import type { CheckApprovalBodySchema, GetQuoteBodySchema, GetSwapBodySchema } from "./types";

export async function getApprovalTransaction(
    parameters: z.infer<typeof CheckApprovalBodySchema>,
    apiKey: string,
    baseUrl: string,
): Promise<string> {
    const url = new URL(`${baseUrl}/check_approval`);

    const response = await fetch(url.toString(), {
        method: "POST",
        body: JSON.stringify(parameters),
        headers: {
            "x-api-key": apiKey,
        },
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch approval: ${response.statusText}`);
    }

    return await response.json();
}

export async function getQuote(
    parameters: z.infer<typeof GetQuoteBodySchema>,
    apiKey: string,
    baseUrl: string,
): Promise<string> {
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
): Promise<string> {
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
