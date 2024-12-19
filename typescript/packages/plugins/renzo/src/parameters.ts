import { z } from "zod";

export const depositSchema = z.object({
    _token: z.string().describe("The token to deposit"),
    _amountIn: z.string().describe("The amount of tokens to deposit"),
    _minOut: z.string().describe("The minimum amount of tokens to receive"),
    _deadline: z.string().describe("The deadline for the deposit"),
});

export const depositETHSchema = z.object({
    _minOut: z.string().describe("The minimum amount of ETH to receive"),
    _deadline: z.string().describe("The deadline for the deposit"),
    _value: z.string().describe("The amount of ETH to send"),
});

export const balanceOfSchema = z.object({
    _address: z.string().describe("The address to check the balance of"),
});
