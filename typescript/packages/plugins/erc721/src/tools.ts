import { approve, balanceOf, totalSupply, transfer, transferFrom } from "./methods";
import {
    approveParametersSchema,
    getBalanceParametersSchema,
    totalSupplyParametersSchema,
    transferFromParametersSchema,
    transferParametersSchema,
} from "./parameters";

import type { EVMWalletClient, Tool } from "@goat-sdk/core";
import type { z } from "zod";
import type { ChainSpecificToken } from "./token";

export function getTools(walletClient: EVMWalletClient, tokenList: ChainSpecificToken[]): Tool[] {
    const tools: Tool[] = [];

    for (const token of tokenList) {
        const balanceTool: Tool = {
            name: `get_${token.symbol}_balance`,
            description: `This {{tool}} gets the number of NFTs owned for ${token.symbol}`,
            parameters: getBalanceParametersSchema,
            method: (parameters: z.infer<typeof getBalanceParametersSchema>) =>
                balanceOf(walletClient, token, parameters),
        };

        const transferTool: Tool = {
            name: `transfer_${token.symbol}`,
            description: `This {{tool}} transfers a ${token.symbol} NFT to the specified address`,
            parameters: transferParametersSchema,
            method: (parameters: z.infer<typeof transferParametersSchema>) => transfer(walletClient, token, parameters),
        };

        const totalSupplyTool: Tool = {
            name: `get_${token.symbol}_total_supply`,
            description: `This {{tool}} gets the total supply of ${token.symbol} NFTs`,
            parameters: totalSupplyParametersSchema,
            method: (parameters: z.infer<typeof totalSupplyParametersSchema>) => totalSupply(walletClient, token),
        };

        const approveTool: Tool = {
            name: `approve_${token.symbol}`,
            description: `This {{tool}} approves an address to transfer a specific ${token.symbol} NFT`,
            parameters: approveParametersSchema,
            method: (parameters: z.infer<typeof approveParametersSchema>) => approve(walletClient, token, parameters),
        };

        const transferFromTool: Tool = {
            name: `transfer_${token.symbol}_from`,
            description: `This {{tool}} transfers a ${token.symbol} NFT from one address to another`,
            parameters: transferFromParametersSchema,
            method: (parameters: z.infer<typeof transferFromParametersSchema>) =>
                transferFrom(walletClient, token, parameters),
        };

        tools.push(balanceTool, transferTool, totalSupplyTool, approveTool, transferFromTool);
    }

    return tools;
}
