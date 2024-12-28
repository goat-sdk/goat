import { z } from "zod";
import { base, arbitrum, mainnet, optimism, scroll, mode, Chain } from 'viem/chains';
import { createToolParameters } from "@goat-sdk/core";

const chainMap: Record<string, Chain> = {
  base,
  arbitrum,
  mainnet,
  optimism,
  scroll,
  mode
};

export const GlobalAddressConfigSchema = z.object({
  owner: z.string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Must be a valid Ethereum address")
    .transform(val => val as `0x${string}`)
    .optional(),
  destChain: z.string()
    .transform((val) => {
      const chain = chainMap[val.toLowerCase()];
      if (!chain) throw new Error(`Invalid chain: ${val}`);
      return chain;
    }),
  slippage: z.number()
    .min(0)
    .max(10000)
    .optional()
});

export class CreateGlobalAddressConfigParams extends createToolParameters(GlobalAddressConfigSchema) {}
