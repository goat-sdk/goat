import { allowance, approve, balanceOf, totalSupply, transfer, transferFrom } from "./methods";
import {
    allowanceParametersSchema,
    approveParametersSchema,
    getBalanceParametersSchema,
    totalSupplyParametersSchema,
    transferFromParametersSchema,
    transferParametersSchema,
} from "./parameters";

import { type ToolBase, createTool } from "@goat-sdk/core";
import type { EVMWalletClient } from "@goat-sdk/wallet-evm";
import type { z } from "zod";
import type { ChainSpecificToken } from "./token";

export function getTools(walletClient: EVMWalletClient, tokenList: ChainSpecificToken[]): ToolBase[] {
    const tools: ToolBase[] = [];

    for (const token of tokenList) {
        const balanceTool = createTool(
            {
                name: `get_${token.symbol}_balance`,
                description: `Get the balance of ${token.symbol}`,
                parameters: getBalanceParametersSchema,
            },
            (parameters: z.infer<typeof getBalanceParametersSchema>) => balanceOf(walletClient, token, parameters),
        );

        const transferTool = createTool(
            {
                name: `transfer_${token.symbol}`,
                description: `Transfer ${token.symbol} to the specified address`,
                parameters: transferParametersSchema,
            },
            (parameters: z.infer<typeof transferParametersSchema>) => transfer(walletClient, token, parameters),
        );

        const totalSupplyTool = createTool(
            {
                name: `get_${token.symbol}_total_supply`,
                description: `Get the total supply of ${token.symbol}`,
                parameters: totalSupplyParametersSchema,
            },
            (parameters: z.infer<typeof totalSupplyParametersSchema>) => totalSupply(walletClient, token),
        );

        const allowanceTool = createTool(
            {
                name: `get_${token.symbol}_allowance`,
                description: `Get the allowance of ${token.symbol}`,
                parameters: allowanceParametersSchema,
            },
            (parameters: z.infer<typeof allowanceParametersSchema>) => allowance(walletClient, token, parameters),
        );

        const approveTool = createTool(
            {
                name: `approve_${token.symbol}`,
                description: `Approve the allowance of ${token.symbol}`,
                parameters: approveParametersSchema,
            },
            (parameters: z.infer<typeof approveParametersSchema>) => approve(walletClient, token, parameters),
        );

        const transferFromTool = createTool(
            {
                name: `transfer_${token.symbol}_from`,
                description: `Transfer ${token.symbol} from the specified address`,
                parameters: transferFromParametersSchema,
            },
            (parameters: z.infer<typeof transferFromParametersSchema>) => transferFrom(walletClient, token, parameters),
        );

        tools.push(balanceTool, transferTool, totalSupplyTool, allowanceTool, approveTool, transferFromTool);
    }

    return tools;
}
