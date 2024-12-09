import type { DeferredTool, SolanaWalletClient } from "@goat-sdk/core";
import type { Connection } from "@solana/web3.js";
import type { z } from "zod";
import { balanceOf } from "../methods/balance";
import { transfer } from "../methods/transfer";
import {
    getBalanceParametersSchema,
    getTokenBalanceByMintAddressParametersSchema,
    transferParametersSchema,
} from "../parameters";
import type { NetworkSpecificToken } from "../tokens";

export function getTools(
    tokenList: NetworkSpecificToken[],
    connection: Connection,
): DeferredTool<SolanaWalletClient>[] {
    const tools: DeferredTool<SolanaWalletClient>[] = [];

    for (const token of tokenList) {
        const balanceTool: DeferredTool<SolanaWalletClient> = {
            name: `get_solana_${token.symbol}_balance`,
            description: `This {{tool}} gets the balance of ${token.symbol}`,
            parameters: getBalanceParametersSchema,
            method: async (walletClient: SolanaWalletClient, parameters: z.infer<typeof getBalanceParametersSchema>) =>
                balanceOf(connection, parameters.wallet, token.mintAddress),
        };

        const transferTool: DeferredTool<SolanaWalletClient> = {
            name: `transfer_solana_${token.symbol}`,
            description: `This {{tool}} transfers ${token.symbol}`,
            parameters: transferParametersSchema,
            method: async (walletClient: SolanaWalletClient, parameters: z.infer<typeof transferParametersSchema>) =>
                transfer(connection, walletClient, parameters.to, token, parameters.amount),
        };

        tools.push(balanceTool, transferTool);
    }

    tools.push({
        name: "get_solana_token_balance_by_mint_address",
        description: "This {{tool}} gets the balance of an SPL token by its mint address",
        parameters: getTokenBalanceByMintAddressParametersSchema,
        method: async (
            walletClient: SolanaWalletClient,
            parameters: z.infer<typeof getTokenBalanceByMintAddressParametersSchema>,
        ) => balanceOf(connection, parameters.wallet, parameters.mintAddress),
    });

    return tools;
}
