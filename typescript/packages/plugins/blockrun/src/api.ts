/**
 * BlockRun API Client wrapper for GOAT SDK.
 *
 * Uses the official @blockrun/llm SDK which handles x402 payments automatically.
 *
 * Payment: USDC on Base network only (chain ID 8453).
 * Security: Your private key NEVER leaves your machine - only used locally for signing.
 */

import { LLMClient, type ChatMessage as BlockrunChatMessage, type ChatResponse } from "@blockrun/llm";

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
    privateKey: `0x${string}`;
}

export class BlockRunAPIClient {
    private client: LLMClient;

    constructor(opts: BlockRunAPIClientOptions) {
        if (!opts.privateKey) {
            throw new Error("privateKey is required for BlockRun x402 payments");
        }

        this.client = new LLMClient({
            privateKey: opts.privateKey,
            apiUrl: opts.baseUrl || "https://blockrun.ai/api",
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
        const result = await this.client.chatCompletion(
            model,
            messages as BlockrunChatMessage[],
            {
                maxTokens: options.maxTokens || 1024,
                temperature: options.temperature,
            },
        );

        // Convert to expected format
        return {
            id: result.id || "",
            model: result.model,
            choices: result.choices.map((c) => ({
                message: {
                    role: c.message.role,
                    content: c.message.content,
                },
                finish_reason: c.finish_reason || "stop",
            })),
            usage: {
                prompt_tokens: result.usage?.prompt_tokens || 0,
                completion_tokens: result.usage?.completion_tokens || 0,
                total_tokens: result.usage?.total_tokens || 0,
            },
        };
    }

    async generateImage(
        model: string,
        prompt: string,
        options: {
            size?: string;
            n?: number;
        } = {},
    ): Promise<ImageGenerationResponse> {
        // Image generation goes through the same payment flow
        // For now, we'll make a direct request since the SDK doesn't have image support yet
        const response = await fetch(`https://blockrun.ai/api/v1/images/generations`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model,
                prompt,
                size: options.size || "1024x1024",
                n: options.n || 1,
            }),
        });

        // Note: This will return 402 - image generation needs x402 handling
        // TODO: Add image support to the SDK
        if (!response.ok) {
            throw new Error(`Image generation failed: ${response.status}`);
        }

        return response.json();
    }

    async getModels(): Promise<BlockRunModel[]> {
        const models = await this.client.listModels();
        return models.map((m) => ({
            id: m.id,
            name: m.id,
            provider: m.id.split("/")[0] || "unknown",
            inputPrice: 0,
            outputPrice: 0,
            contextWindow: 0,
            available: true,
        }));
    }

    getWalletAddress(): string {
        return this.client.getWalletAddress();
    }
}
