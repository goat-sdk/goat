import { execFileSync } from "node:child_process";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TaskmarketAPI } from "./api";
import { TaskmarketService } from "./taskmarket.service";

vi.mock("node:child_process", () => ({
    execFileSync: vi.fn(),
}));

const mockExecFileSync = vi.mocked(execFileSync);

const mockFetch = vi.fn();

const sampleTask = {
    id: `0x${"ab".repeat(32)}`,
    requester: "0xc0566E4F2760cD01D53727cB16D3a829C5787a63",
    description: "Build a landing page",
    reward: "64000000",
    mode: "bounty",
    status: "open",
    submissionCount: 3,
    expiryTime: "2026-08-21T02:38:21.801Z",
    tags: ["web", "base"],
};

function mockFetchResponse(body: unknown, status = 200) {
    mockFetch.mockResolvedValueOnce({
        ok: status >= 200 && status < 300,
        status,
        json: () => Promise.resolve(body),
    } as Response);
}

describe("TaskmarketService", () => {
    let service: TaskmarketService;

    beforeEach(() => {
        mockFetch.mockReset();
        mockExecFileSync.mockReset();
        vi.stubGlobal("fetch", mockFetch);
        service = new TaskmarketService(new TaskmarketAPI());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.unstubAllEnvs();
    });

    describe("listTasks", () => {
        it("returns tasks with reward converted from base units to USDC", async () => {
            mockFetchResponse({ tasks: [sampleTask], hasMore: false });

            const result = await service.listTasks({
                limit: 20,
            });

            expect(result.network).toBe("base");
            expect(result.tasks).toHaveLength(1);
            expect(result.tasks[0].rewardUsdc).toBe(64);
            expect(result.tasks[0].description).toBe("Build a landing page");
            expect(result.tasks[0].submissionCount).toBe(3);
        });

        it("calls the public REST API with status=open, sort=newest and limit", async () => {
            mockFetchResponse({ tasks: [], hasMore: false });

            await service.listTasks({ limit: 20 });

            const url = mockFetch.mock.calls[0][0] as string;
            expect(url).toContain("https://api.taskmarket.dev/api/tasks");
            expect(url).toContain("status=open");
            expect(url).toContain("sort=newest");
            expect(url).toContain("limit=20");
        });

        it("passes the mode filter to the API", async () => {
            mockFetchResponse({ tasks: [], hasMore: false });

            await service.listTasks({ limit: 20, mode: "bounty" });

            const url = mockFetch.mock.calls[0][0] as string;
            expect(url).toContain("mode=bounty");
        });

        it("applies min and max reward filters client side", async () => {
            mockFetchResponse({
                tasks: [
                    { ...sampleTask, id: `0x${"01".repeat(32)}`, reward: "5000000" },
                    { ...sampleTask, id: `0x${"02".repeat(32)}`, reward: "64000000" },
                    { ...sampleTask, id: `0x${"03".repeat(32)}`, reward: "100000000" },
                ],
                hasMore: false,
            });

            const result = await service.listTasks({
                minRewardUsdc: 10,
                maxRewardUsdc: 90,
                limit: 20,
            });

            expect(result.tasks).toHaveLength(1);
            expect(result.tasks[0].rewardUsdc).toBe(64);
        });

        it("throws on a non-ok API response", async () => {
            mockFetchResponse({ message: "boom" }, 500);

            await expect(service.listTasks({ limit: 20 })).rejects.toThrow("status 500");
        });
    });

    describe("getTask", () => {
        it("fetches task details and maps the fields", async () => {
            mockFetchResponse(sampleTask);

            const result = await service.getTask({ taskId: sampleTask.id });

            expect(mockFetch.mock.calls[0][0]).toContain(`/api/tasks/${sampleTask.id}`);
            expect(result.id).toBe(sampleTask.id);
            expect(result.status).toBe("open");
            expect(result.rewardUsdc).toBe(64);
            expect(result.submissionCount).toBe(3);
            expect(result.description).toBe("Build a landing page");
            expect(result.tags).toEqual(["web", "base"]);
        });
    });

    describe("createTask", () => {
        const createParams = {
            description: "Build a landing page",
            rewardUsdc: 5,
            durationHours: 24,
            mode: "bounty" as const,
            confirmation: true,
        };

        it("refuses without confirmation and echoes the exact plan", async () => {
            const result = await service.createTask({
                ...createParams,
                confirmation: false,
            });

            expect(result.status).toBe("requires_confirmation");
            expect(result.description).toBe("Build a landing page");
            expect(result.rewardUsdc).toBe(5);
            expect(result.durationHours).toBe(24);
            expect(result.network).toBe("base");
            expect(mockExecFileSync).not.toHaveBeenCalled();
        });

        it("throws when the reward exceeds the configured spending limit", async () => {
            vi.stubEnv("TASKMARKET_MAX_SPEND_USDC", "10");

            await expect(
                service.createTask({
                    ...createParams,
                    rewardUsdc: 50,
                }),
            ).rejects.toThrow("exceeds the TASKMARKET_MAX_SPEND_USDC limit of 10 USDC");
            expect(mockExecFileSync).not.toHaveBeenCalled();
        });

        it("enforces a default spending limit of 10 USDC when the env var is unset", async () => {
            await expect(
                service.createTask({
                    ...createParams,
                    rewardUsdc: 11,
                }),
            ).rejects.toThrow("limit of 10 USDC");
            expect(mockExecFileSync).not.toHaveBeenCalled();
        });

        it("executes the official taskmarket CLI when confirmed and within the spending limit", async () => {
            mockExecFileSync.mockReturnValue("Task created: 0x1234\n");

            const result = await service.createTask(createParams);

            expect(mockExecFileSync).toHaveBeenCalledTimes(1);
            const [command, args] = mockExecFileSync.mock.calls[0] as [string, string[]];
            expect(command).toBe("taskmarket");
            expect(args).toEqual([
                "task",
                "create",
                "--description",
                "Build a landing page",
                "--reward",
                "5",
                "--duration",
                "24",
                "--mode",
                "bounty",
            ]);
            expect(result.status).toBe("submitted");
            expect(result.cliOutput).toBe("Task created: 0x1234");
            expect(result.network).toBe("base");
        });

        it("throws with the CLI stderr on non-zero exit", async () => {
            const cliError = new Error("Command failed: taskmarket") as Error & { stderr?: string };
            cliError.stderr = "insufficient USDC balance";
            mockExecFileSync.mockImplementation(() => {
                throw cliError;
            });

            await expect(service.createTask(createParams)).rejects.toThrow(
                "The taskmarket CLI failed to create the task. stderr: insufficient USDC balance",
            );
        });

        it("never retries and surfaces unknown settlement on timeout", async () => {
            const timeoutError = new Error("Command timed out") as Error & { code?: string };
            timeoutError.code = "ETIMEDOUT";
            mockExecFileSync.mockImplementation(() => {
                throw timeoutError;
            });

            await expect(service.createTask(createParams)).rejects.toThrow(
                "The settlement status is unknown. Do NOT retry the payment",
            );
        });
    });
});
