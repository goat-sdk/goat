import { z } from "zod";

export const getAvailableGaugesParametersSchema = z.object({});

export const getVotingPowerParametersSchema = z.object({});

export const getCurrentVotesParametersSchema = z.object({
    gaugeAddress: z.string().describe("The address of the gauge to check"),
});

export const voteOnGaugesParametersSchema = z.object({
    gaugeAddresses: z.array(z.string()).describe("Array of gauge addresses to vote on"),
    weights: z.array(z.number()).describe("Array of weights (0-10000) corresponding to each gauge"),
});

export const getUsedVotingWeightParametersSchema = z.object({});

export const getLastVoteTimestampParametersSchema = z.object({});
