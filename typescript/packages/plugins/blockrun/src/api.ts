import axios, { AxiosInstance } from "axios";

export interface BlockRunModel {
    id: string;
    name: string;
    provider: string;
    inputPrice: number;
    outputPrice: number;
    contextWindow: number;
    available: boolean;
}

export interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

export interface ChatCompletionResponse {
    id: string;
    model: string;
    choices: {
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
    }[];
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

export interface ImageGenerationResponse {
    created: number;
    data: {
        url: string;
        revised_prompt?: string;
    }[];
}

export interface BlockRunAPIClientOptions {
    baseUrl?: string;
}

export class BlockRunAPIClient {
    private client: AxiosInstance;
    private baseUrl: string;

    constructor(opts: BlockRunAPIClientOptions = {}) {
        this.baseUrl = opts.baseUrl || "https://blockrun.ai/api/v1";

        this.client = axios.create({
            baseURL: this.baseUrl,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        });
    }

    async chatCompletion(
        model: string,
        messages: ChatMessage[],
        options: {
            maxTokens?: number;
            temperature?: number;
        } = {},
    ): Promise<ChatCompletionResponse> {
        const response = await this.client.post("/chat/completions", {
            model,
            messages,
            max_tokens: options.maxTokens || 1024,
            temperature: options.temperature || 0.7,
        });

        return response.data;
    }

    async generateImage(
        model: string,
        prompt: string,
        options: {
            size?: string;
            n?: number;
        } = {},
    ): Promise<ImageGenerationResponse> {
        const response = await this.client.post("/images/generations", {
            model,
            prompt,
            size: options.size || "1024x1024",
            n: options.n || 1,
        });

        return response.data;
    }

    async getModels(): Promise<BlockRunModel[]> {
        const response = await this.client.get("/models");
        return response.data.data || response.data;
    }
}
