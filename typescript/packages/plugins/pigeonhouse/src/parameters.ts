import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

export class GetTokensParameters extends createToolParameters(z.object({})) {}

export class GetTokenInfoParameters extends createToolParameters(
  z.object({
    tokenMint: z.string().describe("Token mint address on PigeonHouse"),
  })
) {}

export class GetTradesParameters extends createToolParameters(
  z.object({
    tokenMint: z.string().describe("Token mint address"),
    limit: z.number().default(20).describe("Number of trades to return (max 100)"),
  })
) {}

export class BuyTokenParameters extends createToolParameters(
  z.object({
    tokenMint: z.string().describe("Token mint address to buy"),
    quoteAmount: z.number().describe("Amount of quote asset to spend (e.g. 500 for 500 PIGEON)"),
    quoteSymbol: z.string().default("PIGEON").describe("Quote asset: PIGEON, SOL, or SKR"),
    slippageBps: z.number().default(500).describe("Slippage tolerance in basis points (500 = 5%)"),
  })
) {}

export class SellTokenParameters extends createToolParameters(
  z.object({
    tokenMint: z.string().describe("Token mint address to sell"),
    tokenAmount: z.number().describe("Amount of tokens to sell (human readable)"),
    quoteSymbol: z.string().default("PIGEON").describe("Quote asset: PIGEON, SOL, or SKR"),
  })
) {}

export class CalculatePriceParameters extends createToolParameters(
  z.object({
    tokenMint: z.string().describe("Token mint address"),
    direction: z.enum(["buy", "sell"]).describe("Trade direction"),
    amount: z.number().describe("Amount (PIGEON for buy, tokens for sell)"),
  })
) {}
