import { Tool } from "@goat-sdk/core";
import { BlockRunAPIClient, ChatMessage } from "./api";
import { ChatCompletionParameters, GenerateImageParameters, GetModelsParameters } from "./parameters";

export interface BlockRunServiceOptions {
    baseUrl?: string;
}

export class BlockRunService {
    private readonly client: BlockRunAPIClient;

    constructor(opts: BlockRunServiceOptions = {}) {
        this.client = new BlockRunAPIClient(opts);
    }

    @Tool({
        description:
            "Send a prompt to an AI model and get a response using BlockRun's x402 payment gateway. " +
            "Supports 31+ models including GPT-4, Claude, Gemini. " +
            "Payment is handled automatically via USDC micropayments.",
    })
    async chatCompletion(parameters: ChatCompletionParameters) {
        const { model, prompt, systemPrompt, maxTokens, temperature } = parameters;

        const messages: ChatMessage[] = [];

        if (systemPrompt) {
            messages.push({ role: "system", content: systemPrompt });
        }

        messages.push({ role: "user", content: prompt });

        const response = await this.client.chatCompletion(model, messages, {
            maxTokens,
            temperature,
        });

        return {
            model: response.model,
            content: response.choices[0]?.message?.content || "",
            usage: response.usage,
        };
    }

    @Tool({
        description:
            "Generate an image using AI models like DALL-E 3 via BlockRun's x402 payment gateway. " +
            "Payment is handled automatically via USDC micropayments.",
    })
    async generateImage(parameters: GenerateImageParameters) {
        const { model, prompt, size, n } = parameters;

        const response = await this.client.generateImage(model, prompt, {
            size,
            n,
        });

        return {
            images: response.data.map((img) => ({
                url: img.url,
                revisedPrompt: img.revised_prompt,
            })),
        };
    }

    @Tool({
        description:
            "Get the list of available AI models on BlockRun with their pricing information. " +
            "Useful for discovering which models are available and their costs.",
    })
    async getModels(parameters: GetModelsParameters) {
        const { category } = parameters;

        const models = await this.client.getModels();

        if (category === "all") {
            return { models };
        }

        const filtered = models.filter((m) => {
            if (category === "chat") return m.id.includes("gpt") || m.id.includes("claude") || m.id.includes("gemini");
            if (category === "image") return m.id.includes("dall-e") || m.id.includes("imagen");
            if (category === "embedding") return m.id.includes("embed");
            return true;
        });

        return { models: filtered };
    }
}
