import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

const CHAIN_DESC =
  "Chain name (ethereum, arbitrum, base, polygon, bsc, optimism, avalanche, linea, mantle, sonic, berachain, ronin, unichain) or chain ID";

export class GetQuoteParameters extends createToolParameters(
  z.object({
    chain: z.string().describe(CHAIN_DESC),
    tokenIn: z.string().describe("Input token symbol (e.g. ETH, USDC) or contract address"),
    tokenOut: z.string().describe("Output token symbol or contract address"),
    amountIn: z.string().describe("Amount of tokenIn to swap (human-readable, e.g. '1.5')"),
  }),
) {}

export class SwapParameters extends createToolParameters(
  z.object({
    chain: z.string().describe(CHAIN_DESC),
    tokenIn: z.string().describe("Input token symbol or contract address"),
    tokenOut: z.string().describe("Output token symbol or contract address"),
    amountIn: z.string().describe("Amount of tokenIn (human-readable)"),
    slippage: z
      .number()
      .min(1)
      .max(2000)
      .optional()
      .describe(
        "Slippage tolerance in basis points. Auto-detected if omitted (stablecoins: 5bps, major tokens: 50bps, volatile: 100bps)",
      ),
    recipient: z
      .string()
      .optional()
      .describe("Recipient address for output tokens (defaults to sender)"),
  }),
) {}

export class ZapInParameters extends createToolParameters(
  z.object({
    chain: z.string().describe(CHAIN_DESC),
    tokenIn: z.string().describe("Input token symbol or contract address"),
    amountIn: z.string().describe("Amount of tokenIn (human-readable)"),
    pool: z.string().describe("Pool address or pool ID for the concentrated liquidity position"),
    tickLower: z.number().optional().describe("Lower tick bound for the position"),
    tickUpper: z.number().optional().describe("Upper tick bound for the position"),
    dex: z.string().optional().describe("DEX identifier (e.g. DEX_UNISWAPV3, DEX_KYBERSWAP)"),
    slippage: z.number().min(1).max(2000).optional().describe("Slippage tolerance in basis points"),
    positionId: z.string().optional().describe("Existing position ID to add liquidity to"),
  }),
) {}
