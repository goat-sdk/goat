import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

export class GetTokenMintAddressBySymbolParameters extends createToolParameters(
    z.object({
        symbol: z.string().describe("The symbol of the token to get the mint address of (e.g USDC, GOAT, SOL)"),
    }),
) {}

export class GetTokenBalanceByMintAddressParameters extends createToolParameters(
    z.object({
        walletAddress: z.string().describe("The address to get the balance of"),
        mintAddress: z.string().describe("The mint address of the token to get the balance of"),
    }),
) {}

export class TransferTokenByMintAddressParameters extends createToolParameters(
    z.object({
        mintAddress: z.string().describe("The mint address of the token to transfer"),
        to: z.string().describe("The address to transfer the token to"),
        amount: z.string().describe("The amount of tokens to transfer in base unit"),
    }),
) {}

export class ConvertToBaseUnitParameters extends createToolParameters(
    z.object({
        amount: z.number().describe("The amount of tokens to convert to base unit"),
        decimals: z.number().describe("The decimals of the token"),
    }),
) {}
