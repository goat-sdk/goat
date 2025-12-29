import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

export class ChatCompletionParameters extends createToolParameters(
    z.object({
        model: z
            .string()
            .default("openai/gpt-4o")
            .describe("The AI model to use (e.g., openai/gpt-4o, anthropic/claude-3-5-sonnet, google/gemini-2.0-flash)"),
        prompt: z.string().describe("The prompt or message to send to the AI model"),
        systemPrompt: z
            .string()
            .optional()
            .describe("Optional system prompt to set the AI's behavior"),
        maxTokens: z
            .number()
            .optional()
            .default(1024)
            .describe("Maximum number of tokens to generate"),
        temperature: z
            .number()
            .optional()
            .default(0.7)
            .describe("Temperature for response randomness (0-2)"),
    }),
) {}

export class GenerateImageParameters extends createToolParameters(
    z.object({
        model: z
            .string()
            .default("openai/dall-e-3")
            .describe("The image model to use (e.g., openai/dall-e-3)"),
        prompt: z.string().describe("The prompt describing the image to generate"),
        size: z
            .enum(["1024x1024", "1792x1024", "1024x1792"])
            .default("1024x1024")
            .describe("The size of the generated image"),
        n: z
            .number()
            .optional()
            .default(1)
            .describe("Number of images to generate"),
    }),
) {}

export class GetModelsParameters extends createToolParameters(
    z.object({
        category: z
            .enum(["all", "chat", "image", "embedding"])
            .default("all")
            .describe("Filter models by category"),
    }),
) {}
