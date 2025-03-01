import { Tool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";

import { CAMPAIGN_ABI, CAMPAIGN_ADDRESS } from "./abi/hedgey.abi";
import { MERKL_CAMPAIGN_ABI, MERKL_CAMPAIGN_ADDRESS } from "./abi/merkl.abi";
import { HEDGEY_CAMPAIGNS_URL, HEDGEY_CLAIM_URL, HEDGEY_PROOF_URL, MERKL_REVIEW_URL } from "./constants/endpoints";
import { fetchJson, toBytes16 } from "./helpers/http.helper";

import { ClaimProtocolIncentivesParams, ClaimStakingRewardsParams } from "./parameters";
import { ClaimResultProps, HedgeyProofResponse, MerklRewardResponse, NewsEntryProps } from "./types/types";

const NO_CLAIMABLE_MESSAGE = "No claimable tokens available";

export class HedgeyService {
    @Tool({
        name: "claim_hedgey_rewards",
        description: "Claim staking rewards and Hedgey tokens on Optimism",
    })
    async claimHedgeyTokens(
        walletClient: EVMWalletClient,
        parameters: ClaimStakingRewardsParams,
    ): Promise<ClaimResultProps[]> {
        try {
            const newsArray: NewsEntryProps[] = await fetchJson(HEDGEY_CAMPAIGNS_URL);
            const campaignIds: string[] = newsArray
                .map((entry) => {
                    const link = entry.fields.link?.["en-US"];
                    return link ? link.split(HEDGEY_CLAIM_URL)[1] : undefined;
                })
                .filter((campaignId): campaignId is string => !!campaignId);

            const userAddress = walletClient.getAddress();
            const network = walletClient.getChain();
            if (!network?.id) {
                throw new Error("Unable to determine chain ID from wallet client");
            }

            const claimableCampaigns: Array<{
                campaignId: string;
                claimAmount: string;
                proof: string[];
            }> = [];
            const results: ClaimResultProps[] = [];

            const proofPromises = campaignIds.map(async (campaignId) => {
                const proofUrl = `${HEDGEY_PROOF_URL}/${campaignId}/${userAddress}`;
                try {
                    const data: HedgeyProofResponse = await fetchJson(proofUrl);
                    return { campaignId, data, error: null };
                } catch (error) {
                    return { campaignId, data: null, error };
                }
            });

            const settledProofResults = await Promise.allSettled(proofPromises);

            const proofResults = settledProofResults.map((result) => {
                if (result.status === "fulfilled") {
                    return result.value;
                }

                return { campaignId: result.reason.campaignId, data: null, error: result.reason.error };
            });

            for (const result of proofResults) {
                if (result.error) {
                    results.push({
                        campaignId: result.campaignId,
                        detail: `Error: ${result.error instanceof Error ? result.error.message : JSON.stringify(result.error)}`,
                    });
                } else if (!result.data?.canClaim) {
                    results.push({
                        campaignId: result.campaignId,
                        detail: NO_CLAIMABLE_MESSAGE,
                    });
                } else {
                    claimableCampaigns.push({
                        campaignId: result.campaignId,
                        claimAmount: result.data.amount,
                        proof: result.data.proof,
                    });
                }
            }

            if (claimableCampaigns.length > 0) {
                const campaignIdsBytes16 = claimableCampaigns.map((claim) => toBytes16(claim.campaignId));
                const proofs = claimableCampaigns.map((claim) => claim.proof);
                const claimAmounts = claimableCampaigns.map((claim) => claim.claimAmount);

                const txResponse = await walletClient.sendTransaction({
                    to: CAMPAIGN_ADDRESS as `0x${string}`,
                    abi: CAMPAIGN_ABI,
                    functionName: "claimMultiple",
                    args: [campaignIdsBytes16, proofs, claimAmounts],
                });

                for (const claim of claimableCampaigns) {
                    results.push({
                        campaignId: claim.campaignId,
                        detail: "Claimed",
                        amount: claim.claimAmount,
                        transactionHash: txResponse.hash,
                    });
                }
            }

            if (results.length === 0) {
                return [
                    {
                        campaignId: "",
                        detail: NO_CLAIMABLE_MESSAGE,
                    },
                ];
            }

            return results;
        } catch (error) {
            throw new Error(`Failed to claim tokens: ${error instanceof Error ? error.message : error}`);
        }
    }

    @Tool({
        name: "claim_merkl_incentives",
        description: "Claim protocol incentives and Merkl rewards for a given address and chain",
    })
    async claimMerklRewards(
        walletClient: EVMWalletClient,
        parameters: ClaimProtocolIncentivesParams,
    ): Promise<ClaimResultProps[]> {
        try {
            const userAddress = walletClient.getAddress();
            const network = walletClient.getChain();
            if (!network?.id) {
                throw new Error("Unable to determine chain ID from wallet client");
            }
            const chainId = network.id;
            const rewardsUrl = `${MERKL_REVIEW_URL}/${userAddress}/rewards?chainId=${chainId}`;

            const rewardsData: MerklRewardResponse[] = await fetchJson(rewardsUrl);

            const users: string[] = [];
            const tokens: string[] = [];
            const amounts: string[] = [];
            const proofs: string[][] = [];

            for (const rewardsObj of rewardsData) {
                if (rewardsObj.chain.id !== chainId) continue;
                for (const reward of rewardsObj.rewards) {
                    users.push(userAddress);
                    tokens.push(reward.token.address);
                    amounts.push(reward.amount);
                    proofs.push(reward.proofs);
                }
            }

            if (tokens.length === 0) {
                return [
                    {
                        campaignId: "",
                        detail: NO_CLAIMABLE_MESSAGE,
                    },
                ];
            }

            const txResponse = await walletClient.sendTransaction({
                to: MERKL_CAMPAIGN_ADDRESS as `0x${string}`,
                abi: MERKL_CAMPAIGN_ABI,
                functionName: "claim",
                args: [users, tokens, amounts, proofs],
            });

            const results: ClaimResultProps[] = tokens.map((token, i) => ({
                campaignId: token,
                detail: "Claimed",
                amount: amounts[i],
                transactionHash: txResponse.hash,
            }));

            return results;
        } catch (error) {
            throw new Error(`Failed to claim Merkl tokens: ${error instanceof Error ? error.message : error}`);
        }
    }
}
