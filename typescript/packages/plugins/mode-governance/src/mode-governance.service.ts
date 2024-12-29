import { Tool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { formatUnits, parseUnits } from "viem";
import { VOTING_ESCROW_ABI } from "./abi";
import { BPT_VOTING_ESCROW, MODE_VOTING_ESCROW } from "./constants";
import { GetBalanceParameters, GetStakeInfoParameters, StakeParameters } from "./parameters";

export class ModeGovernanceService {
    @Tool({
        description:
            "Stake MODE or BPT tokens in the Mode governance system. Requires MODE or BPT tokens to be approved first.",
    })
    async stakeTokensForModeGovernance(walletClient: EVMWalletClient, parameters: StakeParameters) {
        const escrowAddress = parameters.tokenType === "MODE" ? MODE_VOTING_ESCROW : BPT_VOTING_ESCROW;

        const stakeHash = await walletClient.sendTransaction({
            to: escrowAddress,
            abi: VOTING_ESCROW_ABI,
            functionName: "createLock",
            args: [parseUnits(parameters.amount, 18)],
        });

        return stakeHash.hash;
    }

    @Tool({
        description: "Get Mode governance staking information including lock period and voting power",
    })
    async getModeGovernanceStakeInfo(walletClient: EVMWalletClient, parameters: GetStakeInfoParameters) {
        const escrowAddress = parameters.tokenType === "MODE" ? MODE_VOTING_ESCROW : BPT_VOTING_ESCROW;
        const userAddress = await walletClient.getAddress();

        const tokenIds = (await walletClient.read({
            address: escrowAddress,
            abi: VOTING_ESCROW_ABI,
            functionName: "ownedTokens",
            args: [userAddress],
        })) as unknown as bigint[];

        if (tokenIds.length === 0) {
            return {
                stakedAmount: "0",
                startTime: 0,
                votingPower: "0",
                isVoting: false,
            };
        }

        const tokenId = tokenIds[0];
        const [amount, start] = (await walletClient.read({
            address: escrowAddress,
            abi: VOTING_ESCROW_ABI,
            functionName: "locked",
            args: [tokenId],
        })) as unknown as [bigint, bigint];

        const votingPower = (await walletClient.read({
            address: escrowAddress,
            abi: VOTING_ESCROW_ABI,
            functionName: "votingPower",
            args: [tokenId],
        })) as unknown as bigint;

        const isVoting = (await walletClient.read({
            address: escrowAddress,
            abi: VOTING_ESCROW_ABI,
            functionName: "isVoting",
            args: [tokenId],
        })) as unknown as boolean;

        return {
            stakedAmount: formatUnits(amount, 18),
            startTime: Number(start),
            votingPower: formatUnits(votingPower, 18),
            isVoting,
        };
    }

    @Tool({
        description:
            "Get the Mode governance voting power for any address. Use 'veMode' or 'veBPT' to check voting power.",
    })
    async getModeGovernanceVotingPower(walletClient: EVMWalletClient, parameters: GetBalanceParameters) {
        const userAddress = parameters.address || (await walletClient.getAddress());

        switch (parameters.tokenType) {
            case "MODE":
            case "veMode":
                return formatUnits(
                    (await walletClient.read({
                        address: MODE_VOTING_ESCROW,
                        abi: VOTING_ESCROW_ABI,
                        functionName: "votingPowerForAccount",
                        args: [userAddress],
                    })) as unknown as bigint,
                    18,
                );
            case "BPT":
            case "veBPT":
                return formatUnits(
                    (await walletClient.read({
                        address: BPT_VOTING_ESCROW,
                        abi: VOTING_ESCROW_ABI,
                        functionName: "votingPowerForAccount",
                        args: [userAddress],
                    })) as unknown as bigint,
                    18,
                );
            default:
                throw new Error("Invalid token type");
        }
    }
}
