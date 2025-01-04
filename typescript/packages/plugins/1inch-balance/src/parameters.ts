import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

export class GetAggregatedBalancesAndAllowancesParameters extends createToolParameters(
    z.object({
        chain: z.number().describe("The chain ID to query balances on"),
        spender: z.string().describe("The spender address to check allowances for"),
        wallets: z.array(z.string()).describe("List of wallet addresses to check balances for"),
        filterEmpty: z.boolean().optional().describe("Whether to filter out empty balances"),
    }),
) {}
