import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";
import { YIELD_SIGNAL_ASSETS } from "./client";

export class GetYieldSignalParameters extends createToolParameters(
    z.object({
        asset: z
            .enum(YIELD_SIGNAL_ASSETS)
            .optional()
            .default("USDC")
            .describe(
                "Which market to compare: ETH_STAKING for ETH liquid staking on Ethereum mainnet, USDC or WETH for lending on Base. Defaults to USDC.",
            ),
    }),
) {}
