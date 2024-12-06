import { z } from "zod";

export const getBalanceParametersSchema = z.object({
    wallet: z.string().describe("The address to get the balance of"),
});

export const transferParametersSchema = z.object({
    to: z.string().describe("The address to transfer the token to"),
    amount: z.string().describe("The amount of tokens to transfer"),
});

export const totalSupplyParametersSchema = z.object({});

export const allowanceParametersSchema = z.object({
    owner: z.string().describe("The address to check the allowance of"),
    spender: z.string().describe("The address to check the allowance for"),
});

export const approveParametersSchema = z.object({
    spender: z.string().describe("The address to approve the allowance to"),
    amount: z.string().describe("The amount of tokens to approve"),
});

export const transferFromParametersSchema = z.object({
    from: z.string().describe("The address to transfer the token from"),
    to: z.string().describe("The address to transfer the token to"),
    amount: z.string().describe("The amount of tokens to transfer"),
});
