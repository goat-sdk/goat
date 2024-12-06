import { allowance, approve, balanceOf, totalSupply, transfer, transferFrom } from "./methods";
import {
    allowanceParametersSchema,
    approveParametersSchema,
    getBalanceParametersSchema,
    totalSupplyParametersSchema,
    transferFromParametersSchema,
    transferParametersSchema,
} from "./parameters";

import type { DeferredTool, EVMWalletClient } from "@goat-sdk/core";
import type { z } from "zod";
import type { ChainSpecificToken } from "./token";

export function getTools(tokenList: ChainSpecificToken[]): DeferredTool<EVMWalletClient>[] {
    const tools: DeferredTool<EVMWalletClient>[] = [];

    for (const token of tokenList) {
        const balanceTool: DeferredTool<EVMWalletClient> = {
            name: `get_${token.symbol}_balance`,
            description: `This {{tool}} gets the balance of ${token.symbol}`,
            parameters: getBalanceParametersSchema,
            method: (walletClient: EVMWalletClient, parameters: z.infer<typeof getBalanceParametersSchema>) =>
                balanceOf(walletClient, token, parameters),
        };

        const transferTool: DeferredTool<EVMWalletClient> = {
            name: `transfer_${token.symbol}`,
            description: `This {{tool}} transfers ${token.symbol} to the specified address`,
            parameters: transferParametersSchema,
            method: (walletClient: EVMWalletClient, parameters: z.infer<typeof transferParametersSchema>) =>
                transfer(walletClient, token, parameters),
        };

        const totalSupplyTool: DeferredTool<EVMWalletClient> = {
            name: `get_${token.symbol}_total_supply`,
            description: `This {{tool}} gets the total supply of ${token.symbol}`,
            parameters: totalSupplyParametersSchema,
            method: (walletClient: EVMWalletClient, parameters: z.infer<typeof totalSupplyParametersSchema>) =>
                totalSupply(walletClient, token),
        };

        const allowanceTool: DeferredTool<EVMWalletClient> = {
            name: `get_${token.symbol}_allowance`,
            description: `This {{tool}} gets the allowance of ${token.symbol}`,
            parameters: allowanceParametersSchema,
            method: (walletClient: EVMWalletClient, parameters: z.infer<typeof allowanceParametersSchema>) =>
                allowance(walletClient, token, parameters),
        };

        const approveTool: DeferredTool<EVMWalletClient> = {
            name: `approve_${token.symbol}`,
            description: `This {{tool}} approves the allowance of ${token.symbol}`,
            parameters: approveParametersSchema,
            method: (walletClient: EVMWalletClient, parameters: z.infer<typeof approveParametersSchema>) =>
                approve(walletClient, token, parameters),
        };

        const transferFromTool: DeferredTool<EVMWalletClient> = {
            name: `transfer_${token.symbol}_from`,
            description: `This {{tool}} transfers ${token.symbol} from the specified address`,
            parameters: transferFromParametersSchema,
            method: (walletClient: EVMWalletClient, parameters: z.infer<typeof transferFromParametersSchema>) =>
                transferFrom(walletClient, token, parameters),
        };

        tools.push(balanceTool, transferTool, totalSupplyTool, allowanceTool, approveTool, transferFromTool);
    }

    return tools;
}
