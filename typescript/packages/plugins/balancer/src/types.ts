import { z } from "zod";
import { Chain, Plugin, Tool, WalletClient } from "@goat-sdk/core";

export const SwapParamsSchema = z.object({
  pool: z.string(),
  tokenIn: z.string(),
  tokenOut: z.string(),
  amountIn: z.string(),
  slippage: z.string().default("0.1"), // Default 0.1% slippage
  deadline: z.number().optional(),
  wethIsEth: z.boolean().default(false)
});

export const LiquidityParamsSchema = z.object({
  pool: z.string(),
  amounts: z.array(z.object({
    token: z.string(),
    amount: z.string(),
    decimals: z.number()
  })),
  slippage: z.string().default("0.1"), // Default 0.1% slippage
  deadline: z.number().optional(),
  wethIsEth: z.boolean().default(false)
});

export type SwapParams = z.infer<typeof SwapParamsSchema>;
export type LiquidityParams = z.infer<typeof LiquidityParamsSchema>; 