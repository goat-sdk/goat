import type { DeferredTool, SolanaWalletClient } from "@goat-sdk/core";
import type { NetworkSpecificToken } from "../tokens";
import { getBalanceParametersSchema, transferParametersSchema } from "../parameters";
import type { Connection } from "@solana/web3.js";
import type { z } from "zod";
import { transfer } from "../methods/transfer";
import { balanceOf } from "../methods/balance";

export function getTools(
    tokenList: NetworkSpecificToken[],
    connection: Connection,
): DeferredTool<SolanaWalletClient>[] {
    const tools: DeferredTool<SolanaWalletClient>[] = [];

    for (const token of tokenList) {
        const balanceTool: DeferredTool<SolanaWalletClient> = {
            name: `get_${token.symbol}_balance`,
            description: `This {{tool}} gets the balance of ${token.symbol}`,
            parameters: getBalanceParametersSchema,
            method: async (walletClient: SolanaWalletClient, parameters: z.infer<typeof getBalanceParametersSchema>) =>
                balanceOf(connection, parameters.wallet, token),
        };

        const transferTool: DeferredTool<SolanaWalletClient> = {
            name: `transfer_${token.symbol}`,
            description: `This {{tool}} transfers ${token.symbol}`,
            parameters: transferParametersSchema,
            method: async (walletClient: SolanaWalletClient, parameters: z.infer<typeof transferParametersSchema>) =>
                transfer(connection, walletClient, parameters.to, token, parameters.amount),
        };

        tools.push(balanceTool, transferTool);
    }

    return tools;
}
