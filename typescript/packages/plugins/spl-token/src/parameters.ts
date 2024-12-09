import { z } from "zod";

export const getBalanceParametersSchema = z.object({
    wallet: z.string().describe("The address to get the balance of"),
});

export const transferParametersSchema = z.object({
    to: z.string().describe("The address to transfer the token to"),
    amount: z.string().describe("The amount of tokens to transfer"),
});

export const getTokenBalanceByMintAddressParametersSchema = getBalanceParametersSchema.extend({
    mintAddress: z.string().describe("The mint address of the token to get the balance of"),
});
