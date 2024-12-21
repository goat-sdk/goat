import { type ToolBase, createTool } from "@goat-sdk/core";
import type { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { parseAbi } from "viem";
import type { z } from "zod";
import {
    getAvailableGaugesParametersSchema,
    getCurrentVotesParametersSchema,
    getLastVoteTimestampParametersSchema,
    getUsedVotingWeightParametersSchema,
    getVotingPowerParametersSchema,
    voteOnGaugesParametersSchema,
} from "./parameters";
import { MODE_CONTRACTS } from "./types";

const GAUGE_VOTER_ABI = parseAbi([
    "function vote(address[] calldata _tokenVote, uint256[] calldata _weights) external",
    "function votes(address voter, address gauge) external view returns (uint256)",
    "function usedWeights(address voter) external view returns (uint256)",
    "function getGauges() external view returns (address[] memory)",
    "function lastVote(address voter) external view returns (uint256)",
]);

const VOTING_ESCROW_ABI = parseAbi([
    "function totalSupply() external view returns (uint256)",
    "function balanceOf(address) external view returns (uint256)",
    "function locked(uint256) external view returns (int128 amount, uint256 end)",
]);

export function getTools(walletClient: EVMWalletClient): ToolBase[] {
    return [
        createTool(
            {
                name: "get_available_gauges",
                description: "Gets a list of all available gauge addresses that can be voted on",
                parameters: getAvailableGaugesParametersSchema,
            },
            async () => {
                const gauges = await walletClient.read({
                    address: MODE_CONTRACTS.GAUGE_VOTER,
                    abi: GAUGE_VOTER_ABI,
                    functionName: "getGauges",
                });
                return gauges.value as string[];
            }
        ),

        createTool(
            {
                name: "get_voting_power",
                description: "Gets the current voting power of the wallet",
                parameters: getVotingPowerParametersSchema,
            },
            async () => {
                const address = await walletClient.getAddress();
                const balance = await walletClient.read({
                    address: MODE_CONTRACTS.VOTING_ESCROW,
                    abi: VOTING_ESCROW_ABI,
                    functionName: "balanceOf",
                    args: [address],
                });
                return (balance.value as bigint).toString();
            }
        ),

        createTool(
            {
                name: "get_current_votes",
                description: "Gets the current votes allocated to a specific gauge",
                parameters: getCurrentVotesParametersSchema,
            },
            async (parameters: z.infer<typeof getCurrentVotesParametersSchema>) => {
                const address = await walletClient.getAddress();
                const votes = await walletClient.read({
                    address: MODE_CONTRACTS.GAUGE_VOTER,
                    abi: GAUGE_VOTER_ABI,
                    functionName: "votes",
                    args: [address, parameters.gaugeAddress as `0x${string}`],
                });
                return (votes.value as bigint).toString();
            }
        ),

        createTool(
            {
                name: "vote_on_gauges",
                description: "Vote on multiple gauges with specified weights. Weights should sum to 10000 (100%)",
                parameters: voteOnGaugesParametersSchema,
            },
            async (parameters: z.infer<typeof voteOnGaugesParametersSchema>) => {
                const totalWeight = parameters.weights.reduce((a, b) => a + b, 0);
                if (totalWeight !== 10000) {
                    throw new Error("Total weights must sum to 10000 (100%)");
                }

                if (parameters.gaugeAddresses.length !== parameters.weights.length) {
                    throw new Error("Number of gauges must match number of weights");
                }

                const hash = await walletClient.sendTransaction({
                    to: MODE_CONTRACTS.GAUGE_VOTER,
                    abi: GAUGE_VOTER_ABI,
                    functionName: "vote",
                    args: [
                        parameters.gaugeAddresses as `0x${string}`[],
                        parameters.weights.map(w => BigInt(w)),
                    ],
                });

                return hash.hash;
            }
        ),

        createTool(
            {
                name: "get_used_voting_weight",
                description: "Gets the total voting weight currently used by the wallet",
                parameters: getUsedVotingWeightParametersSchema,
            },
            async () => {
                const address = await walletClient.getAddress();
                const usedWeight = await walletClient.read({
                    address: MODE_CONTRACTS.GAUGE_VOTER,
                    abi: GAUGE_VOTER_ABI,
                    functionName: "usedWeights",
                    args: [address],
                });
                return (usedWeight.value as bigint).toString();
            }
        ),

        createTool(
            {
                name: "get_last_vote_timestamp",
                description: "Gets the timestamp of the last vote cast by the wallet",
                parameters: getLastVoteTimestampParametersSchema,
            },
            async () => {
                const address = await walletClient.getAddress();
                const lastVote = await walletClient.read({
                    address: MODE_CONTRACTS.GAUGE_VOTER,
                    abi: GAUGE_VOTER_ABI,
                    functionName: "lastVote",
                    args: [address],
                });
                return (lastVote.value as bigint).toString();
            }
        ),
    ];
}