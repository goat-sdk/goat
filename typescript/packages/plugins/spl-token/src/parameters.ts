import { z } from "zod";
import { splTokenSymbolSchema } from "./tokens";

export const getTokenMintAddressBySymbolParametersSchema = z.object({
    symbol: splTokenSymbolSchema.describe("The symbol of the token to get the mint address of"),
});

export const getTokenBalanceByMintAddressParametersSchema = z.object({
    walletAddress: z.string().describe("The address to get the balance of"),
    mintAddress: z.string().describe("The mint address of the token to get the balance of"),
});

export const transferTokenByMintAddressParametersSchema = z.object({
    mintAddress: z.string().describe("The mint address of the token to transfer"),
    to: z.string().describe("The address to transfer the token to"),
    amount: z.string().describe("The amount of tokens to transfer"),
});
