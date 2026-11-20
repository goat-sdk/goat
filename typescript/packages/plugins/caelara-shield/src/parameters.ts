import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

const chain = z.enum(["solana", "ethereum", "base", "arbitrum", "optimism", "polygon", "bnb"]);

const routeShape = {
    fromChain: chain.describe("Source chain"),
    toChain: chain.optional().describe("Destination chain. A value different from fromChain means a bridge"),
    tokenIn: z.string().describe('"native", a token address or a Solana mint'),
    tokenOut: z.string().describe('"native", a token address or a Solana mint'),
    amount: z
        .string()
        .regex(/^[1-9][0-9]*$/)
        .describe("Integer string in the smallest unit of tokenIn"),
    slippageBps: z.number().int().min(1).max(500).optional().describe("Slippage in basis points, 1 to 500"),
    overrideRisk: z
        .boolean()
        .optional()
        .describe(
            "Let a high-risk or unscreened token through. Only set true after the human user has seen the screening result and agreed",
        ),
};

export class GetRouteQuoteParameters extends createToolParameters(
    z.object({
        ...routeShape,
        taker: z.string().optional().describe("Wallet address on fromChain"),
    }),
) {}

export class BuildSafeSwapParameters extends createToolParameters(
    z.object({
        ...routeShape,
        taker: z.string().describe("Wallet address on fromChain that will sign the transactions"),
    }),
) {}
