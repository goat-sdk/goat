import { z } from "zod";

/**
 * Creates a Zod schema for Crossmint order parameters
 * @param callDataSchema - Schema for contract-specific call data validation
 * @returns Zod schema object defining the structure of order parameters
 */
export function getCreateAndPayOrderParameters(callDataSchema: z.ZodSchema) {
    return z.object({
        recipient: z
            .union([
                z.object({
                    walletAddress: z.string(),
                }),
                z.object({
                    email: z.string().email(),
                }),
            ])
            .describe(
                "Where the tokens will be sent to - either a wallet address or email, if email is provided a Crossmint wallet will be created and associated with the email",
            ),
        payment: z
            .object({
                method: z
                    .enum(["ethereum", "ethereum-sepolia", "base", "base-sepolia", "polygon", "polygon-amoy", "solana"])
                    .describe("The blockchain network to use for the transaction"), // TODO: This is not the full list of methods
                currency: z.enum(["usdc"]).describe("The currency to use for payment"), // TODO: This is not the full list of currencies
                payerAddress: z.string().describe("The address that will pay for the transaction"), // TODO: This required for now, as this will create and buy the order in 1 tool
                receiptEmail: z.string().optional().describe("Optional email to send payment receipt to"),
            })
            .describe(
                "Payment configuration - the desired blockchain, currency and address of the payer - optional receipt email, if an email recipient was not provided",
            ),
        lineItems: z
            .array(
                z.object({
                    collectionLocator: z
                        .string()
                        .describe(
                            "The collection locator. Ex: 'crossmint:<crossmint_collection_id>', '<chain>:<contract_address>'",
                        ), // TODO: Add tokenLocator support
                    callData: callDataSchema,
                }),
            )
            .describe("Array of items to purchase"),
    });
}
