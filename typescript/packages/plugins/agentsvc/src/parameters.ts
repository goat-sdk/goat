import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

const chain = z
    .enum(["base", "ethereum", "bsc", "arbitrum", "polygon", "avalanche", "optimism", "solana"])
    .optional()
    .describe("Chain of the token. Defaults to base");

export class TokenPrecheckParameters extends createToolParameters(
    z.object({
        tokens: z
            .array(z.string())
            .min(1)
            .max(5)
            .describe("One to five token contract addresses (0x...) or Solana mint addresses"),
        chain,
    }),
) {}

export class TokenVerdictParameters extends createToolParameters(
    z.object({
        token: z.string().describe("Token contract address (0x...) or Solana mint address"),
        chain,
    }),
) {}

export class ScamMessageParameters extends createToolParameters(
    z.object({
        text: z.string().max(8000).describe("The message to check (DM, cast, tweet, email or comment)"),
        sender: z.string().optional().describe("Optional sender name or handle"),
        channel: z.string().optional().describe("Optional channel, for example telegram, x, farcaster or email"),
    }),
) {}

export class PromptInjectionParameters extends createToolParameters(
    z.object({
        text: z.string().max(20000).describe("Untrusted text: a web page, email, tool result or user message"),
        context: z.string().optional().describe("Optional: what the agent is doing"),
    }),
) {}
