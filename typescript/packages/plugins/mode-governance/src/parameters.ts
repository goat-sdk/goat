import { z } from "zod";

export const stakeParametersSchema = z.object({
    amount: z.string().describe("The amount of tokens to stake"),
    tokenType: z.enum(["MODE", "BPT"]).describe("The type of token to stake (MODE or BPT)"),
});

export const unstakeParametersSchema = z.object({
    amount: z.string().describe("The amount of tokens to unstake"),
    tokenType: z.enum(["MODE", "BPT"]).describe("The type of token to unstake (MODE or BPT)"),
});

export const getStakeInfoParametersSchema = z.object({
    tokenType: z.enum(["MODE", "BPT"]).describe("The type of token to get info for (MODE or BPT)"),
});

export const getBalanceParametersSchema = z.object({
    tokenType: z.enum(["MODE", "BPT", "veMode", "veBPT"]).describe("The type of token to get balance for"),
}); 