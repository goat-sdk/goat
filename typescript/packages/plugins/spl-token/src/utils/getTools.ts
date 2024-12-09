import type { DeferredTool, SolanaWalletClient } from "@goat-sdk/core";
import type { Connection } from "@solana/web3.js";
import type { z } from "zod";
import { balanceOf } from "../methods/balance";
import { transfer } from "../methods/transfer";
import {
    getTokenBalanceByMintAddressParametersSchema,
    getTokenMintAddressBySymbolParametersSchema,
    transferTokenByMintAddressParametersSchema,
} from "../parameters";
import type { SolanaNetwork } from "../tokens";
import { getTokenMintAddressBySymbol } from "./getTokenMintAddressBySymbol";

export function getTools(connection: Connection, network: SolanaNetwork): DeferredTool<SolanaWalletClient>[] {
    const tools: DeferredTool<SolanaWalletClient>[] = [];

    tools.push({
        name: "get_token_mint_address_by_symbol",
        description: "This {{tool}} gets the mint address of an SPL token by its symbol",
        parameters: getTokenMintAddressBySymbolParametersSchema,
        method: async (
            walletClient: SolanaWalletClient,
            parameters: z.infer<typeof getTokenMintAddressBySymbolParametersSchema>,
        ) => getTokenMintAddressBySymbol(parameters.symbol, network),
    });

    tools.push({
        name: "get_token_balance_by_mint_address",
        description:
            "This {{tool}} gets the balance of an SPL token by its mint address. Use get_token_mint_address_by_symbol to get the mint address first.",
        parameters: getTokenBalanceByMintAddressParametersSchema,
        method: async (
            walletClient: SolanaWalletClient,
            parameters: z.infer<typeof getTokenBalanceByMintAddressParametersSchema>,
        ) => balanceOf(connection, parameters.walletAddress, parameters.mintAddress),
    });

    tools.push({
        name: "transfer_token_by_mint_address",
        description:
            "This {{tool}} transfers an SPL token by its mint address. Use get_token_mint_address_by_symbol to get the mint address first.",
        parameters: transferTokenByMintAddressParametersSchema,
        method: async (
            walletClient: SolanaWalletClient,
            parameters: z.infer<typeof transferTokenByMintAddressParametersSchema>,
        ) => transfer(connection, network, walletClient, parameters.to, parameters.mintAddress, parameters.amount),
    });

    return tools;
}
