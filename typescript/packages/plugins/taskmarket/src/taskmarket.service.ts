import { execFileSync } from "node:child_process";
import { Tool } from "@goat-sdk/core";
import { TaskmarketAPI } from "./api";
import { CreateTaskParameters, GetTaskParameters, ListTasksParameters } from "./parameters";

export const TASKMARKET_BASE_NETWORK = "base";
const USDC_DECIMALS = 1_000_000;
const DEFAULT_MAX_SPEND_USDC = 10;
const CREATE_TASK_TIMEOUT_MS = 120_000;

function rewardBaseUnitsToUsdc(reward: string | number): number {
    return Number(reward) / USDC_DECIMALS;
}

function maxSpendUsdc(): number {
    const raw = process.env.TASKMARKET_MAX_SPEND_USDC;
    if (!raw) {
        return DEFAULT_MAX_SPEND_USDC;
    }
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MAX_SPEND_USDC;
}

export class TaskmarketService {
    constructor(protected api: TaskmarketAPI) {}

    @Tool({
        name: "taskmarket_list_tasks",
        description:
            "List open tasks on Taskmarket (Base network). Tasks are paid in USDC. Optionally filter by minimum or maximum reward in USDC and by task mode.",
    })
    async listTasks(parameters: ListTasksParameters) {
        const { minRewardUsdc, maxRewardUsdc, mode, limit } = parameters;
        const response = await this.api.listTasks({ limit, mode });
        const tasks = response.tasks.filter((task) => {
            const rewardUsdc = rewardBaseUnitsToUsdc(task.reward);
            if (minRewardUsdc !== undefined && rewardUsdc < minRewardUsdc) {
                return false;
            }
            if (maxRewardUsdc !== undefined && rewardUsdc > maxRewardUsdc) {
                return false;
            }
            return true;
        });
        return {
            network: TASKMARKET_BASE_NETWORK,
            tasks: tasks.slice(0, limit).map((task) => ({
                id: task.id,
                description: task.description,
                rewardUsdc: rewardBaseUnitsToUsdc(task.reward),
                mode: task.mode,
                status: task.status,
                submissionCount: task.submissionCount,
                expiryTime: task.expiryTime,
                tags: task.tags ?? [],
            })),
            hasMore: response.hasMore ?? false,
        };
    }

    @Tool({
        name: "taskmarket_get_task",
        description: "Get the details of a single Taskmarket task on the Base network by its task ID",
    })
    async getTask(parameters: GetTaskParameters) {
        const task = await this.api.getTask(parameters.taskId);
        return {
            id: task.id,
            status: task.status,
            rewardUsdc: rewardBaseUnitsToUsdc(task.reward),
            expiryTime: task.expiryTime,
            submissionCount: task.submissionCount,
            description: task.description,
            mode: task.mode,
            requester: task.requester,
            tags: task.tags ?? [],
        };
    }

    @Tool({
        name: "taskmarket_create_task",
        description:
            "Create a new task on Taskmarket on the Base network. The reward is paid in USDC from the wallet managed by the official taskmarket CLI. Requires explicit confirmation and enforces the TASKMARKET_MAX_SPEND_USDC spending limit. Never retries on timeout.",
    })
    async createTask(parameters: CreateTaskParameters) {
        const { description, rewardUsdc, durationHours, mode, confirmation } = parameters;

        const plan = {
            description,
            rewardUsdc,
            durationHours,
            mode,
            network: TASKMARKET_BASE_NETWORK,
        };

        if (!confirmation) {
            return {
                ...plan,
                status: "requires_confirmation",
                message:
                    "Creating this task spends real USDC on the Base network. Call this tool again with confirmation: true to proceed.",
            };
        }

        const limit = maxSpendUsdc();
        if (rewardUsdc > limit) {
            throw new Error(
                `Reward of ${rewardUsdc} USDC exceeds the TASKMARKET_MAX_SPEND_USDC limit of ${limit} USDC. Refusing to create the task.`,
            );
        }

        const args = [
            "task",
            "create",
            "--description",
            description,
            "--reward",
            String(rewardUsdc),
            "--duration",
            String(durationHours),
            "--mode",
            mode,
        ];

        let stdout: string;
        try {
            stdout = execFileSync("taskmarket", args, {
                encoding: "utf8",
                timeout: CREATE_TASK_TIMEOUT_MS,
                stdio: ["ignore", "pipe", "pipe"],
            });
        } catch (error) {
            const err = error as { stderr?: string; message?: string; code?: string };
            const details = err.stderr?.trim() || err.message || "unknown error";
            if (err.code === "ETIMEDOUT") {
                throw new Error(
                    `The taskmarket CLI timed out after ${CREATE_TASK_TIMEOUT_MS / 1000} seconds. The settlement status is unknown. Do NOT retry the payment; verify on Taskmarket whether the task was created before taking any further action. stderr: ${details}`,
                );
            }
            throw new Error(`The taskmarket CLI failed to create the task. stderr: ${details}`);
        }

        return {
            ...plan,
            status: "submitted",
            cliOutput: stdout.trim(),
        };
    }
}
