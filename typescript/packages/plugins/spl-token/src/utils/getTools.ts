import type { SolanaWalletClient, Tool } from "@goat-sdk/core";
import type { Connection } from "@solana/web3.js";
import type { z } from "zod";
import { balanceOf } from "../methods/balance";
import { convertToBaseUnit } from "../methods/convert-to-base-unit";
import { transfer } from "../methods/transfer";
import {
    convertToBaseUnitParametersSchema,
    getTokenBalanceByMintAddressParametersSchema,
    getTokenMintAddressBySymbolParametersSchema,
    transferTokenByMintAddressParametersSchema,
} from "../parameters";
import type { SolanaNetwork, Token } from "../tokens";
import { getTokenInfoBySymbol } from "./getTokenInfoBySymbol";

export function getTools(
    walletClient: SolanaWalletClient,
    connection: Connection,
    network: SolanaNetwork,
    tokens: Token[],
): Tool[] {
    const tools: Tool[] = [];

    tools.push({
        name: "get_token_info_by_symbol",
        description:
            "This {{tool}} gets the SPL token info by its symbol, including the mint address, decimals, and name",
        parameters: getTokenMintAddressBySymbolParametersSchema,
        method: async (parameters: z.infer<typeof getTokenMintAddressBySymbolParametersSchema>) =>
            getTokenInfoBySymbol(parameters.symbol, tokens, network),
    });

    tools.push({
        name: "get_token_balance_by_mint_address",
        description:
            "This {{tool}} gets the balance of an SPL token by its mint address. Use get_token_mint_address_by_symbol to get the mint address first.",
        parameters: getTokenBalanceByMintAddressParametersSchema,
        method: async (parameters: z.infer<typeof getTokenBalanceByMintAddressParametersSchema>) =>
            balanceOf(connection, parameters.walletAddress, parameters.mintAddress),
    });

    tools.push({
        name: "transfer_token_by_mint_address",
        description:
            "This {{tool}} transfers an SPL token by its mint address. Use get_token_mint_address_by_symbol to get the mint address first.",
        parameters: transferTokenByMintAddressParametersSchema,
        method: async (parameters: z.infer<typeof transferTokenByMintAddressParametersSchema>) =>
            transfer(connection, network, walletClient, parameters.to, parameters.mintAddress, parameters.amount),
    });

    tools.push({
        name: "convert_to_base_unit",
        description: "This {{tool}} converts an amount of an SPL token to its base unit",
        parameters: convertToBaseUnitParametersSchema,
        method: async (parameters: z.infer<typeof convertToBaseUnitParametersSchema>) =>
            convertToBaseUnit(parameters.amount, parameters.decimals),
    });

    return tools;
}
