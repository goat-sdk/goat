import { Tool } from "@goat-sdk/core";
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

export class ModeGovernanceService {
    @Tool({
        description: "Stake MODE or BPT tokens in the Mode governance system. Requires MODE or BPT tokens to be approved first.",
    })
    async stakeTokens(walletClient: EVMWalletClient, parameters: StakeParameters) {
        const escrowAddress = parameters.tokenType === "MODE" ? MODE_VOTING_ESCROW : BPT_VOTING_ESCROW;
        
        const stakeHash = await walletClient.sendTransaction({
            to: escrowAddress,
            abi: VOTING_ESCROW_ABI,
            functionName: "stake",
            args: [parseUnits(parameters.amount, 18)],
        });

        return stakeHash.hash;
    }

    @Tool({
        description: "Get staking information including warmup and cooldown periods",
    })
    async getStakeInfo(walletClient: EVMWalletClient, parameters: GetStakeInfoParameters) {
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
    }

    @Tool({
        description: "Get the balance of MODE, BPT, veMode, or veBPT tokens for any address",
    })
    async getBalance(walletClient: EVMWalletClient, parameters: GetBalanceParameters & { address?: string }) {
        const userAddress = parameters.address || await walletClient.getAddress();
        
        switch (parameters.tokenType) {
            case "veMode":
                return formatUnits(await walletClient.read({
                    address: MODE_VOTING_ESCROW,
                    abi: VOTING_ESCROW_ABI,
                    functionName: "balanceOf",
                    args: [userAddress],
                }), 18);
            case "veBPT":
                return formatUnits(await walletClient.read({
                    address: BPT_VOTING_ESCROW,
                    abi: VOTING_ESCROW_ABI,
                    functionName: "balanceOf",
                    args: [userAddress],
                }), 18);
            default:
                // For MODE and BPT, we are using the ERC20 plugin instead as discussed in the PR 87
                throw new Error("Use ERC20 plugin to check MODE or BPT balances");
        }
    }
} 