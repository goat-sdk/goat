import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

export const SwapConfigSchema = z.object({
  sellTokenAddress: z.string()
    .regex(/^0x[a-fA-F0-9]+$/, "Must be a valid Starknet address")
    .describe("The address of the token to sell"),
  
  buyTokenAddress: z.string()
    .regex(/^0x[a-fA-F0-9]+$/, "Must be a valid Starknet address")
    .describe("The address of the token to buy"),
  
  sellAmount: z.string()
    .describe("The amount of tokens to sell (in wei)"),
});

export class SwapConfigParams extends createToolParameters(SwapConfigSchema) {}
