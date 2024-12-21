import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { parseUnits, formatUnits } from "viem";
import { VOTING_ESCROW_ABI, MODE_TOKEN_ABI, BPT_TOKEN_ABI } from "./abi";
import {
    MODE_TOKEN_ADDRESS,
    BPT_TOKEN_ADDRESS,
    MODE_VOTING_ESCROW,
    BPT_VOTING_ESCROW,
} from "./constants";
import {
    StakeParameters,
    GetStakeInfoParameters,
    GetBalanceParameters,
} from "./parameters";

export function getTools(walletClient: EVMWalletClient): Tool[] {
    const tools: Tool[] = [];


    const stakeTool: Tool = {
        name: "stake_tokens",
        description: "This {{tool}} stakes MODE or BPT tokens in the Mode governance system",
        parameters: StakeParameters,
        method: async (parameters) => {
            const tokenAddress = parameters.tokenType === "MODE" ? MODE_TOKEN_ADDRESS : BPT_TOKEN_ADDRESS;
            const escrowAddress = parameters.tokenType === "MODE" ? MODE_VOTING_ESCROW : BPT_VOTING_ESCROW;
            
            // First check and approve tokens
            const approveHash = await walletClient.sendTransaction({
                to: tokenAddress,
                abi: parameters.tokenType === "MODE" ? MODE_TOKEN_ABI : BPT_TOKEN_ABI,
                functionName: "approve",
                args: [escrowAddress, parseUnits(parameters.amount, 18)],
            });

            // Wait for approval bef4 staking
            await walletClient.waitForTransactionReceipt({ hash: approveHash.hash });


            const stakeHash = await walletClient.sendTransaction({
                to: escrowAddress,
                abi: VOTING_ESCROW_ABI,
                functionName: "stake",
                args: [parseUnits(parameters.amount, 18)],
            });

            return stakeHash.hash;
        },
    };


    const getStakeInfoTool: Tool = {
        name: "get_stake_info",
        description: "This {{tool}} gets staking information including warmup and cooldown periods",
        parameters: GetStakeInfoParameters,
        method: async (parameters) => {
            const escrowAddress = parameters.tokenType === "MODE" ? MODE_VOTING_ESCROW : BPT_VOTING_ESCROW;
            const userAddress = await walletClient.getAddress();

            const stakeInfo = await walletClient.read({
                address: escrowAddress,
                abi: VOTING_ESCROW_ABI,
                functionName: "getUserStakeInfo",
                args: [userAddress],
            });

            const warmupPeriod = await walletClient.read({
                address: escrowAddress,
                abi: VOTING_ESCROW_ABI,
                functionName: "getWarmupPeriod",
            });

            const cooldownPeriod = await walletClient.read({
                address: escrowAddress,
                abi: VOTING_ESCROW_ABI,
                functionName: "getCooldownPeriod",
            });

            return {
                stakedAmount: formatUnits(stakeInfo[0], 18),
                warmupEndTime: Number(stakeInfo[1]),
                cooldownEndTime: Number(stakeInfo[2]),
                warmupPeriod: Number(warmupPeriod),
                cooldownPeriod: Number(cooldownPeriod),
            };
        },
    };


    const getBalanceTool: Tool = {
        name: "get_balance",
        description: "This {{tool}} gets the balance of MODE, BPT, veMode, or veBPT tokens",
        parameters: GetBalanceParameters,
        method: async (parameters) => {
            const userAddress = await walletClient.getAddress();
            let tokenAddress;
            let abi;

            switch (parameters.tokenType) {
                case "MODE":
                    tokenAddress = MODE_TOKEN_ADDRESS;
                    abi = MODE_TOKEN_ABI;
                    break;
                case "BPT":
                    tokenAddress = BPT_TOKEN_ADDRESS;
                    abi = BPT_TOKEN_ABI;
                    break;
                case "veMode":
                    tokenAddress = MODE_VOTING_ESCROW;
                    abi = VOTING_ESCROW_ABI;
                    break;
                case "veBPT":
                    tokenAddress = BPT_VOTING_ESCROW;
                    abi = VOTING_ESCROW_ABI;
                    break;
            }

            const balance = await walletClient.read({
                address: tokenAddress,
                abi: abi,
                functionName: "balanceOf",
                args: [userAddress],
            });

            return formatUnits(balance, 18);
        },
    };

    tools.push(stakeTool, getStakeInfoTool, getBalanceTool);
    return tools;
} 