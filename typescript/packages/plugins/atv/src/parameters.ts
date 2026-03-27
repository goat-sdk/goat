import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

export class NoParams extends createToolParameters(z.object({})) {}

// --- Vault read parameters ---

export class ListVaultsParameters extends createToolParameters(
    z.object({
        chain: z
            .string()
            .optional()
            .describe("Filter by chain name or ID (e.g. 'ethereum', 'base', '8453')"),
        userAddress: z
            .string()
            .optional()
            .describe("EVM address to include token balances for each deposit token"),
    }),
) {}

export class VaultAddressParameters extends createToolParameters(
    z.object({
        address: z.string().describe("Vault contract address"),
    }),
) {}

export class VaultAddressWithUserParameters extends createToolParameters(
    z.object({
        address: z.string().describe("Vault contract address"),
        userAddress: z.string().optional().describe("EVM address to include token balances for"),
    }),
) {}

export class HistoricalDataParameters extends createToolParameters(
    z.object({
        address: z.string().describe("Vault contract address"),
        days: z
            .enum(["7", "30", "60", "360", "max"])
            .optional()
            .default("30")
            .describe("Period of history: '7', '30', '60', '360', or 'max'"),
    }),
) {}

export class UserInvestmentsParameters extends createToolParameters(
    z.object({
        userAddress: z.string().describe("EVM address of the user"),
        vaultAddress: z.string().describe("Vault contract address"),
    }),
) {}

// --- Transaction parameters ---

export class DepositParameters extends createToolParameters(
    z.object({
        vaultAddress: z.string().describe("Vault contract address"),
        depositTokenAddress: z.string().describe("ERC20 token address to deposit"),
        depositAmount: z
            .string()
            .describe("Human-readable deposit amount, e.g. '100' for 100 USDC"),
    }),
) {}

export class StakeParameters extends createToolParameters(
    z.object({
        vaultAddress: z.string().describe("Vault contract address"),
        lockPeriodIndex: z
            .string()
            .describe("0-indexed lock period to select from the timelock contract (e.g. '0', '1', '2')"),
        stakeAmount: z
            .string()
            .describe("Human-readable vault token amount to stake, e.g. '100'"),
    }),
) {}

export class UnstakeParameters extends createToolParameters(
    z.object({
        vaultAddress: z.string().describe("Vault contract address"),
        stakeIndex: z
            .string()
            .describe("0-indexed position in the user's stake array to unstake from"),
        unstakeAmount: z
            .string()
            .describe("Human-readable vault token amount to unstake, e.g. '100'"),
    }),
) {}

export class WithdrawParameters extends createToolParameters(
    z.object({
        vaultAddress: z.string().describe("Vault contract address"),
        oTokenAddress: z.string().describe("Output token address to receive"),
        sharesToWithdraw: z
            .string()
            .describe("Human-readable share amount to withdraw, e.g. '100'"),
        slippage: z
            .string()
            .optional()
            .describe("Slippage tolerance as a percentage, e.g. '0.5'"),
    }),
) {}

export class QueueWithdrawParameters extends createToolParameters(
    z.object({
        vaultAddress: z.string().describe("Vault contract address"),
        withdrawTokenAddress: z
            .string()
            .describe("Output token address to receive when the withdrawal is redeemed"),
        tokensToWithdraw: z
            .string()
            .describe("Human-readable vault share amount to queue for withdrawal"),
    }),
) {}

export class UnqueueWithdrawParameters extends createToolParameters(
    z.object({
        vaultAddress: z.string().describe("Vault contract address"),
        oTokenAddress: z
            .string()
            .describe("Output token address of the queued request to cancel"),
        requestId: z
            .string()
            .optional()
            .describe("Specific request ID to cancel (omit to cancel the latest request)"),
    }),
) {}

export class RedeemWithdrawParameters extends createToolParameters(
    z.object({
        vaultAddress: z.string().describe("Vault contract address"),
        oTokens: z
            .string()
            .describe("Human-readable amount of output tokens to redeem"),
        batchCounter: z
            .string()
            .describe("Batch identifier from the queue contract for this withdrawal"),
    }),
) {}
