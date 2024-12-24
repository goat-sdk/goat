import { z } from "zod";

/**
 * Creates a Zod schema for Crossmint order parameters
 * @param callDataSchema - Schema for contract-specific call data validation
 * @returns Zod schema object defining the structure of order parameters
 */
export function getCreateAndPayOrderParameters(callDataSchema: z.ZodSchema) {
    return z.object({
        /**
         * Where the tokens will be sent to - either a wallet address or email, if email is provided a Crossmint wallet will be created and associated with the email
         */
        recipient: z.union([
            z.object({
                walletAddress: z.string(),
            }),
            z.object({
                email: z.string().email(),
            }),
        ]),
        /**
         * Payment configuration - the desired blockchain, currency and address of the payer - optional receipt email, if an email recipient was not provided
         */
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
        /**
         * Array of items to purchase
         */
        lineItems: z.array(
            z.object({
                /**
                 * The collection locator. Ex: 'crossmint:3351221a-6d91-419a-b3a9-a6c54b74ab78'
                 */
                collectionLocator: z.string(), // TODO: Add tokenLocator support
                callData: callDataSchema,
            }),
        ),
    });
}
