import { z } from "zod";

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 4e5c6e8 (add first commits)
export const flowParametersSchema = z.object({
    token: z
        .string()
        .describe("The address of the Super Token to get the flow of"),
    receiver: z.string().describe("The address of the receiver of the flow"),
    flowrate: z.string().describe("The flowrate of the flow"),
<<<<<<< HEAD
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
=======
>>>>>>> 4e5c6e8 (add first commits)
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

<<<<<<< HEAD
export const transferFromParametersSchema = z.object({
    from: z.string().describe("The address to transfer the token from"),
    to: z.string().describe("The address to transfer the token to"),
    amount: z.string().describe("The amount of tokens to transfer"),
>>>>>>> 906163d (start superfluid plugin)
=======
export const getMemberFlowRateParametersSchema = z.object({
    poolAddress: z.string().describe("The address of the Pool contract"),
    memberAddr: z
        .string()
        .describe("The address of the member to get flow rate for"),
});

export const getTotalFlowRateParametersSchema = z.object({
    poolAddress: z.string().describe("The address of the Pool contract"),
>>>>>>> 4e5c6e8 (add first commits)
});
