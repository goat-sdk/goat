import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

export class GetBalanceParameters extends createToolParameters(
    z.object({
        account: z.string().describe("The account address to check balances for"),
        tokens: z.record(z.string(), z.array(z.string()))
            .describe("Map of chainId to array of token addresses")
    })
) {}

export class GetAllowanceParameters extends createToolParameters(
    z.object({
        chainId: z.number().describe("The chain ID"),
        token: z.string().describe("The token address"),
        owner: z.string().describe("The token owner address"),
        spenders: z.array(z.string()).describe("Array of spender addresses")
    })
) {}

export class GetQuoteParameters extends createToolParameters(
    z.object({
        chainId: z.number().describe("The chain ID"),
        sellToken: z.string().describe("The token address to sell"),
        buyToken: z.string().describe("The token address to buy"),
        order: z.object({
            type: z.enum(["sell", "buy"]),
            sellAmount: z.string()
        }).describe("Order details"),
        slippagePercentage: z.number().describe("Maximum allowed slippage"),
        gasSpeed: z.object({
            speed: z.enum(["instant", "fast", "standard", "slow"])
        }).optional(),
        config: z.object({
            sort: z.object({
                by: z.string()
            })
        }).optional()
    })
) {}

export class ExecuteSwapParameters extends GetQuoteParameters {} 