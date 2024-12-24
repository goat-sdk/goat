import { z } from "zod";

export function getCreateAndPayOrderParameters(callDataSchema: z.ZodSchema) {
    return z.object({
        recipient: z.union([
            z.object({
                walletAddress: z.string(),
            }),
            z.object({
                email: z.string().email(),
            }),
        ]),
        payment: z.object({
            method: z.enum([
                "ethereum",
                "ethereum-sepolia",
                "base",
                "base-sepolia",
                "polygon",
                "polygon-amoy",
                "solana",
            ]), // TOOD: This is not the full list of methods
            currency: z.enum(["usdc"]), // TODO: This is not the full list of currencies
            payerAddress: z.string(), // TODO: This required for now, as this will create and buy the order in 1 tool
            receiptEmail: z.string().optional(),
        }),
        lineItems: z.array(
            z.object({
                // TODO: Add tokenLocator support
                collectionLocator: z.string(),
                callData: callDataSchema,
            }),
        ),
    });
}
