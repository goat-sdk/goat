import { z } from "zod";

export const stakeParametersSchema = z.object({
    amount: z.string().describe("Amount of MODE tokens to stake"),
    lockDuration: z.number().describe("Lock duration in weeks (max 52)"),
});

export const unstakeParametersSchema = z.object({
    tokenId: z.string().describe("NFT token ID representing the staking position"),
});

export const increaseAmountParametersSchema = z.object({
    tokenId: z.string().describe("NFT token ID representing the staking position"),
    additionalAmount: z.string().describe("Additional amount of MODE tokens to stake"),
});

export const increaseLockTimeParametersSchema = z.object({
    tokenId: z.string().describe("NFT token ID representing the staking position"),
    additionalWeeks: z.number().describe("Additional weeks to lock (total max 52)"),
});

export const getStakingPositionParametersSchema = z.object({
    tokenId: z.string().describe("NFT token ID to query"),
});

export const getStakingPositionsParametersSchema = z.object({
    walletAddress: z
        .string()
        .optional()
        .describe("Wallet address to query positions for (defaults to connected wallet)"),
});

export const getCooldownInfoParametersSchema = z.object({
    tokenId: z.string().describe("NFT token ID to check cooldown for"),
});

export const getWarmupInfoParametersSchema = z.object({
    tokenId: z.string().describe("NFT token ID to check warmup for"),
});
