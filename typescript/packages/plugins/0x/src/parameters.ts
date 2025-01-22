import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

export class GetQuoteParameters extends createToolParameters(
    z.object({
        chainId: z.number().describe("The chain ID to swap on"),
        sellToken: z.string().describe("The token to sell"),
        buyToken: z.string().describe("The token to buy"),
        sellAmount: z.string().describe("The amount of tokens to sell in base units"),
        taker: z
            .string()
            .describe("The address which holds the sellToken balance and has the allowance set for the swap"),
        txOrigin: z
            .string()
            .optional()
            .describe(
                "The contract address of the external account that started the transaction. This is only needed if taker is a smart contract.",
            ),
        slippageBps: z
            .number()
            .optional()
            .describe(
                "The maximum acceptable slippage of the buyToken in Bps. If this parameter is set to 0, no slippage will be tolerated. If not provided, the default slippage tolerance is 100Bps",
            ),
    }),
) {}
