import { Tool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";

import { CAMPAIGN_ABI, CAMPAIGN_ADDRESS } from "./abi/hedgey.abi";
import { fetchJSON, postJSON, toBytes16 } from "./helpers/http.helper";
import { ClaimStakingRewardsParams } from "./parameters";
import { ClaimHedgeyRewardsResponse, HedgeyProofResponse, NewsEntryProps } from "./types/types";

import { API_CONFIG } from "./config/config";

const NO_CLAIMABLE_MESSAGE = "No claimable tokens available";

export class HedgeyService {
    @Tool({
        name: "claim_hedgey_rewards",
        description: "Claim staking rewards and Hedgey tokens on Optimism",
    })
    async claimHedgeyRewards(
        walletClient: EVMWalletClient,
        parameters: ClaimStakingRewardsParams,
    ): Promise<ClaimHedgeyRewardsResponse[]> {
        try {
            const campaignIds = await this.fetchCampaignIds();

            const userAddress = walletClient.getAddress();
            const network = walletClient.getChain();
            if (!network?.id) {
                throw new Error("Unable to determine chain ID from wallet client");
            }
            // Filter campaigns: only process those that are active and haven't been claimed yet
            const activeCampaignIds = await this.filterActiveCampaigns(campaignIds, userAddress);
            if (activeCampaignIds.length === 0) {
                return [{ campaignId: "", detail: NO_CLAIMABLE_MESSAGE }];
            }
            const proofPromises = activeCampaignIds.map((campaignId) =>
                this.fetchProofForCampaign(campaignId, userAddress),
            );
            const settledProofResults = await Promise.allSettled(proofPromises);

            const proofResults = settledProofResults.map((result) => {
                if (result.status === "fulfilled") {
                    return result.value;
                }
                let campaignId = "unknown";
                if (result.reason && typeof result.reason === "object" && "campaignId" in result.reason) {
                    campaignId = result.reason.campaignId;
                }
                return { campaignId, data: null, error: result.reason };
            });

            // Process proof results
            const { claimableCampaigns, results } = this.processProofResults(proofResults);

            // If there are claimable campaigns, execute the transaction
            if (claimableCampaigns.length > 0) {
                const { transactionHash } = await this.executeClaimTransactions(walletClient, claimableCampaigns);
                for (const claim of claimableCampaigns) {
                    results.push({
                        campaignId: claim.campaignId,
                        detail: "Claimed",
                        amount: claim.claimAmount,
                        transactionHash: transactionHash,
                    });
                }
            }

            if (results.length === 0) {
                return [{ campaignId: "", detail: NO_CLAIMABLE_MESSAGE }];
            }

            return results;
        } catch (error) {
            throw new Error(`Failed to claim tokens: ${error instanceof Error ? error.message : error}`);
        }
    }

    private async filterActiveCampaigns(campaignIds: string[], userAddress: string): Promise<string[]> {
        // Obtain information for each campaign to verify its status.
        const campaignInfoPromises = campaignIds.map(async (campaignId) => {
            try {
                const url = `${API_CONFIG.HEDGEY_TOKEN_CLAIMS_INFO_URL}/${campaignId}`;
                const info = await fetchJSON(url);
                return { campaignId, info };
            } catch (e) {
                return { campaignId, info: null, error: e };
            }
        });
        const campaignInfoResults = await Promise.all(campaignInfoPromises);

        // Query the claim events for the user's address via the GraphQL endpoint.
        const graphqlBody = {
            operationName: "GetClaimsForAddress",
            query: `
        query GetClaimsForAddress($input: TokenCampaignEventsResolverInput) {
          TokenCampaignEvents(input: $input) {
            events { campaignId }
          }
        }`,
            variables: { input: { eventType: "TokensClaimed", address: userAddress, includeTestnets: true } },
        };
        const rawData = await postJSON(API_CONFIG.HEDGEY_GRAPHQL_ENDPOINT, graphqlBody);
        const claimsData = rawData as HedgeyClaimsResponse;

        const claimedCampaignIds = new Set<string>();
        if (claimsData?.data?.TokenCampaignEvents?.events) {
            for (const event of claimsData.data.TokenCampaignEvents.events) {
                if (event.campaignId) {
                    claimedCampaignIds.add(event.campaignId);
                }
            }
        }
        // Filter the campaigns that are active and haven't been claimed yet.
        const activeCampaignIds: string[] = [];
        for (const result of campaignInfoResults) {
            // Using type assertion or defining an interface for result.info
            if (
                result.info &&
                (result.info as { campaignStatus: string }).campaignStatus === "active" &&
                !claimedCampaignIds.has(result.campaignId)
            ) {
                activeCampaignIds.push(result.campaignId);
            }
        }
        return activeCampaignIds;
    }

    private async fetchCampaignIds(): Promise<string[]> {
        const rawData = await fetchJSON(API_CONFIG.HEDGEY_CAMPAIGNS_URL);
        const newsArray = rawData as NewsEntryProps[];
        return newsArray
            .map((entry) => {
                const link = entry.fields.link?.["en-US"];
                return link ? link.split(API_CONFIG.HEDGEY_CLAIM_URL)[1] : undefined;
            })
            .filter((campaignId): campaignId is string => !!campaignId);
    }

    private async fetchProofForCampaign(
        campaignId: string,
        userAddress: string,
    ): Promise<{ campaignId: string; data: HedgeyProofResponse | null; error: unknown }> {
        const proofUrl = `${API_CONFIG.HEDGEY_PROOF_URL}/${campaignId}/${userAddress}`;
        try {
            const data = await fetchJSON(proofUrl);
            return { campaignId, data: data as HedgeyProofResponse, error: null };
        } catch (error) {
            return { campaignId, data: null, error };
        }
    }

    private processProofResults(
        proofResults: Array<{ campaignId: string; data: HedgeyProofResponse | null; error: unknown }>,
    ): {
        claimableCampaigns: Array<{ campaignId: string; claimAmount: string; proof: string[] }>;
        results: ClaimHedgeyRewardsResponse[];
    } {
        const claimableCampaigns: Array<{ campaignId: string; claimAmount: string; proof: string[] }> = [];
        const results: ClaimHedgeyRewardsResponse[] = [];
        for (const result of proofResults) {
            if (result.error) {
                results.push({
                    campaignId: result.campaignId,
                    detail: `Error: ${
                        result.error instanceof Error ? result.error.message : JSON.stringify(result.error)
                    }`,
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
        return { claimableCampaigns, results };
    }

    private async executeClaimTransaction(
        walletClient: EVMWalletClient,
        claimableCampaigns: Array<{ campaignId: string; claimAmount: string; proof: string[] }>,
    ): Promise<{ transactionHash: string }> {
        const campaignIdsBytes16 = claimableCampaigns.map((claim) => toBytes16(claim.campaignId));
        const proofs = claimableCampaigns.map((claim) => claim.proof);
        const claimAmounts = claimableCampaigns.map((claim) => claim.claimAmount);
        try {
            const txResponse = await walletClient.sendTransaction({
                to: CAMPAIGN_ADDRESS as `0x${string}`,
                abi: CAMPAIGN_ABI,
                functionName: "claimMultiple",
                args: [campaignIdsBytes16, proofs, claimAmounts],
            });
            return { transactionHash: txResponse.hash };
        } catch (txError) {
            throw new Error(
                `Transaction failed: ${txError instanceof Error ? txError.message : JSON.stringify(txError)}`,
            );
        }
    }

    private async executeClaimTransactions(
        walletClient: EVMWalletClient,
        claimableCampaigns: Array<{ campaignId: string; claimAmount: string; proof: string[] }>,
    ): Promise<{ transactionHash: string }> {
        const transactionHashes: string[] = [];

        for (const campaign of claimableCampaigns) {
            try {
                const txResponse = await walletClient.sendTransaction({
                    to: CAMPAIGN_ADDRESS as `0x${string}`,
                    abi: CAMPAIGN_ABI,
                    functionName: "claim",
                    args: [toBytes16(campaign.campaignId), campaign.proof, campaign.claimAmount],
                });

                transactionHashes.push(txResponse.hash);
            } catch (txError) {
                throw new Error(
                    `Transaction failed for campaignId=${campaign.campaignId}: ${
                        txError instanceof Error ? txError.message : JSON.stringify(txError)
                    }`,
                );
            }
        }

        return { transactionHash: transactionHashes.join(",") };
    }
}

interface HedgeyClaimsResponse {
    data?: {
        TokenCampaignEvents?: {
            events?: Array<{ campaignId?: string }>;
        };
    };
}
