export interface TaskmarketTask {
    id: string;
    description: string;
    reward: string;
    mode: string;
    status: string;
    submissionCount: number;
    expiryTime: string;
    tags?: string[];
    requester?: string;
}

export interface TaskListResponse {
    tasks: TaskmarketTask[];
    nextCursor?: string | null;
    hasMore?: boolean;
}

export interface ListTasksParams {
    limit: number;
    mode?: string;
}

export const TASKMARKET_API_BASE_URL = "https://api.taskmarket.dev/api";

export class TaskmarketAPI {
    async listTasks(params: ListTasksParams): Promise<TaskListResponse> {
        const url = new URL(`${TASKMARKET_API_BASE_URL}/tasks`);
        url.searchParams.set("status", "open");
        url.searchParams.set("sort", "newest");
        url.searchParams.set("limit", String(params.limit));
        if (params.mode) {
            url.searchParams.set("mode", params.mode);
        }
        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error(`Taskmarket API request failed with status ${response.status}`);
        }
        return (await response.json()) as TaskListResponse;
    }

    async getTask(taskId: string): Promise<TaskmarketTask> {
        const response = await fetch(`${TASKMARKET_API_BASE_URL}/tasks/${taskId}`);
        if (!response.ok) {
            throw new Error(`Taskmarket API request failed with status ${response.status}`);
        }
        return (await response.json()) as TaskmarketTask;
    }
}
