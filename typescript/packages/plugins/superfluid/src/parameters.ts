import { z } from "zod";

<<<<<<< HEAD
export const flowParametersSchema = z.object({
    token: z
        .string()
        .describe("The address of the Super Token to get the flow of"),
    receiver: z.string().describe("The address of the receiver of the flow"),
    flowrate: z.string().describe("The flowrate of the flow"),
});

export const getFlowrateParametersSchema = z.object({
    token: z
        .string()
        .describe("The address of the Super Token to get the flow of"),
    sender: z.string().describe("The address of the sender of the flow"),
    receiver: z.string().describe("The address of the receiver of the flow"),
});

export const updateMemberUnitsParametersSchema = z.object({
    poolAddress: z.string().describe("The address of the Pool contract"),
    memberAddr: z
        .string()
        .describe("The address of the member to update units for"),
    newUnits: z.string().describe("The new units amount for the member"),
});

export const getUnitsParametersSchema = z.object({
    poolAddress: z.string().describe("The address of the Pool contract"),
    memberAddr: z
        .string()
        .describe("The address of the member to get units for"),
});

export const getMemberFlowRateParametersSchema = z.object({
    poolAddress: z.string().describe("The address of the Pool contract"),
    memberAddr: z
        .string()
        .describe("The address of the member to get flow rate for"),
});

export const getTotalFlowRateParametersSchema = z.object({
    poolAddress: z.string().describe("The address of the Pool contract"),
=======
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
>>>>>>> 906163d (start superfluid plugin)
});
