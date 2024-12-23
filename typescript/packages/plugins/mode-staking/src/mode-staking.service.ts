import { type ToolBase, createTool } from "@goat-sdk/core";
import type { EVMWalletClient } from "@goat-sdk/wallet-evm";
import type { z } from "zod";
import { CLOCK_ABI, EXIT_QUEUE_ABI, MODE_TOKEN_ABI, VENFT_LOCK_ABI, VOTING_ESCROW_ABI } from "./constants";
import {
    getCooldownInfoParametersSchema,
    getStakingPositionParametersSchema,
    getStakingPositionsParametersSchema,
    getWarmupInfoParametersSchema,
    increaseAmountParametersSchema,
    increaseLockTimeParametersSchema,
    stakeParametersSchema,
    unstakeParametersSchema,
} from "./parameters";
import { MODE_CONTRACTS } from "./types";

export function getTools(walletClient: EVMWalletClient): ToolBase[] {
    return [
        // Stake MODE tokens
        createTool(
            {
                name: "stake_mode",
                description: "Stake MODE tokens for voting power and receive an NFT token ID",
                parameters: stakeParametersSchema,
            },
            async (parameters: z.infer<typeof stakeParametersSchema>) => {
                // First approve tokens
                const approveHash = await walletClient.sendTransaction({
                    to: MODE_CONTRACTS.MODE_TOKEN,
                    abi: MODE_TOKEN_ABI,
                    functionName: "approve",
                    args: [MODE_CONTRACTS.VOTING_ESCROW, BigInt(parameters.amount)],
                });

                // Wait for approval
                await walletClient.waitForTransactionReceipt({ hash: approveHash.hash });

                // Calculate unlock time (current time + weeks)
                const unlockTime = Math.floor(Date.now() / 1000) + parameters.lockDuration * 7 * 24 * 60 * 60;

                // Create lock
                const stakeHash = await walletClient.sendTransaction({
                    to: MODE_CONTRACTS.VOTING_ESCROW,
                    abi: VOTING_ESCROW_ABI,
                    functionName: "create_lock",
                    args: [BigInt(parameters.amount), BigInt(unlockTime)],
                });

                return stakeHash.hash;
            },
        ),

        // Get staking positions
        createTool(
            {
                name: "get_staking_positions",
                description: "Get all MODE staking positions for a specified wallet",
                parameters: getStakingPositionsParametersSchema,
            },
            async (parameters: z.infer<typeof getStakingPositionsParametersSchema>) => {
                const address = parameters.walletAddress || (await walletClient.getAddress());

                // Get number of NFTs
                const balance = await walletClient.read({
                    address: MODE_CONTRACTS.VENFT_LOCK,
                    abi: VENFT_LOCK_ABI,
                    functionName: "balanceOf",
                    args: [address],
                });

                const positions = [];
                const nftCount = Number(balance.value);

                // Get all positions
                for (let i = 0; i < nftCount; i++) {
                    const tokenId = await walletClient.read({
                        address: MODE_CONTRACTS.VENFT_LOCK,
                        abi: VENFT_LOCK_ABI,
                        functionName: "tokenOfOwnerByIndex",
                        args: [address, BigInt(i)],
                    });

                    const locked = await walletClient.read({
                        address: MODE_CONTRACTS.VOTING_ESCROW,
                        abi: VOTING_ESCROW_ABI,
                        functionName: "locked",
                        args: [tokenId.value as bigint],
                    });

                    const votingPower = await walletClient.read({
                        address: MODE_CONTRACTS.VOTING_ESCROW,
                        abi: VOTING_ESCROW_ABI,
                        functionName: "balanceOfNFT",
                        args: [tokenId.value as bigint],
                    });

                    positions.push({
                        tokenId: (tokenId.value as bigint).toString(),
                        amount: (locked.value[0] as bigint).toString(),
                        lockEnd: Number(locked.value[1]),
                        votingPower: (votingPower.value as bigint).toString(),
                    });
                }

                return positions;
            },
        ),

        // Increase amount
        createTool(
            {
                name: "increase_stake_amount",
                description: "Increase the MODE token stake amount for an existing position",
                parameters: increaseAmountParametersSchema,
            },
            async (parameters: z.infer<typeof increaseAmountParametersSchema>) => {
                // Approve additional tokens
                const approveHash = await walletClient.sendTransaction({
                    to: MODE_CONTRACTS.MODE_TOKEN,
                    abi: MODE_TOKEN_ABI,
                    functionName: "approve",
                    args: [MODE_CONTRACTS.VOTING_ESCROW, BigInt(parameters.additionalAmount)],
                });

                await walletClient.waitForTransactionReceipt({ hash: approveHash.hash });

                // Increase amount
                const hash = await walletClient.sendTransaction({
                    to: MODE_CONTRACTS.VOTING_ESCROW,
                    abi: VOTING_ESCROW_ABI,
                    functionName: "increase_amount",
                    args: [BigInt(parameters.tokenId), BigInt(parameters.additionalAmount)],
                });

                return hash.hash;
            },
        ),

        // Increase lock time
        createTool(
            {
                name: "increase_lock_time",
                description: "Increase the lock duration for an existing MODE position",
                parameters: increaseLockTimeParametersSchema,
            },
            async (parameters: z.infer<typeof increaseLockTimeParametersSchema>) => {
                const newUnlockTime = Math.floor(Date.now() / 1000) + parameters.additionalWeeks * 7 * 24 * 60 * 60;

                const hash = await walletClient.sendTransaction({
                    to: MODE_CONTRACTS.VOTING_ESCROW,
                    abi: VOTING_ESCROW_ABI,
                    functionName: "increase_unlock_time",
                    args: [BigInt(parameters.tokenId), BigInt(newUnlockTime)],
                });

                return hash.hash;
            },
        ),

        // Get cooldown info
        createTool(
            {
                name: "get_cooldown_info",
                description: "Get cooldown status and timing for a MODE staking position",
                parameters: getCooldownInfoParametersSchema,
            },
            async (parameters: z.infer<typeof getCooldownInfoParametersSchema>) => {
                const cooldownEnd = await walletClient.read({
                    address: MODE_CONTRACTS.EXIT_QUEUE,
                    abi: EXIT_QUEUE_ABI,
                    functionName: "cooldowns",
                    args: [BigInt(parameters.tokenId)],
                });

                const currentTime = Math.floor(Date.now() / 1000);
                const endTime = Number(cooldownEnd.value);

                return {
                    isInCooldown: endTime > currentTime,
                    cooldownEnd: endTime,
                    remainingTime: Math.max(0, endTime - currentTime),
                };
            },
        ),

        // Get warmup info
        createTool(
            {
                name: "get_warmup_info",
                description: "Get warmup status and timing for a MODE staking position",
                parameters: getWarmupInfoParametersSchema,
            },
            async (parameters: z.infer<typeof getWarmupInfoParametersSchema>) => {
                const warmupEnd = await walletClient.read({
                    address: MODE_CONTRACTS.EXIT_QUEUE,
                    abi: EXIT_QUEUE_ABI,
                    functionName: "warmups",
                    args: [BigInt(parameters.tokenId)],
                });

                const currentTime = Math.floor(Date.now() / 1000);
                const endTime = Number(warmupEnd.value);

                return {
                    isInWarmup: endTime > currentTime,
                    warmupEnd: endTime,
                    remainingTime: Math.max(0, endTime - currentTime),
                };
            },
        ),

        // Unstake
        createTool(
            {
                name: "unstake_mode",
                description: "Withdraw MODE tokens from a staking position",
                parameters: unstakeParametersSchema,
            },
            async (parameters: z.infer<typeof unstakeParametersSchema>) => {
                const hash = await walletClient.sendTransaction({
                    to: MODE_CONTRACTS.VOTING_ESCROW,
                    abi: VOTING_ESCROW_ABI,
                    functionName: "withdraw",
                    args: [BigInt(parameters.tokenId)],
                });

                return hash.hash;
            },
        ),
    ];
}
