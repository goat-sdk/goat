import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

export class ListTasksParameters extends createToolParameters(
    z.object({
        minRewardUsdc: z
            .number()
            .nonnegative()
            .optional()
            .describe("Only include tasks with a reward of at least this many USDC"),
        maxRewardUsdc: z
            .number()
            .positive()
            .optional()
            .describe("Only include tasks with a reward of at most this many USDC"),
        mode: z
            .enum(["bounty", "claim", "pitch", "benchmark", "auction"])
            .optional()
            .describe("Only include tasks with this mode"),
        limit: z.number().int().min(1).max(100).default(20).describe("Maximum number of tasks to return"),
    }),
) {}

export class GetTaskParameters extends createToolParameters(
    z.object({
        taskId: z
            .string()
            .regex(/^0x[0-9a-fA-F]{64}$/)
            .describe("The task ID, a 0x-prefixed 32-byte hex string"),
    }),
) {}

export class CreateTaskParameters extends createToolParameters(
    z.object({
        description: z.string().min(1).max(2000).describe("The task description shown to workers on Taskmarket"),
        rewardUsdc: z.number().positive().describe("The reward for the task in USDC, e.g. 5 for 5 USDC"),
        durationHours: z.number().positive().describe("How long the task stays open, in hours"),
        mode: z.enum(["bounty", "claim", "pitch", "benchmark", "auction"]).default("bounty").describe("The task mode"),
        confirmation: z
            .boolean()
            .describe(
                "Explicit confirmation that this task should be created and funded. Must be true. This action spends real USDC on the Base network from the wallet managed by the taskmarket CLI.",
            ),
    }),
) {}
