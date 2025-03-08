import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

export class ClaimStakingRewardsParams extends createToolParameters(
    z.object({
        campaignId: z.string().optional().describe("Optional UUID of the Hedgey staking rewards campaign"),
    }),
) {}
