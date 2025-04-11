import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

export class NativeSolTransferParams extends createToolParameters(
    z.object({
        recipient: z.string().describe("Recipient address"),
        amount: z.number().positive().describe("Amount to send, in lamports (1 SOL = 1e9 lamports)"),
    }),
) {}

export class CheckSPLTokenInfoParams extends createToolParameters(
    z.object({
        tokenMint: z.string().describe("SPL token mint address"),
        walletAddress: z.string().optional().describe("Wallet address to check (defaults to current wallet)"),
    }),
) {}

export class NativeSPLTransferParams extends createToolParameters(
    z.object({
        tokenMint: z.string().describe("SPL token mint address"),
        recipient: z.string().describe("Recipient wallet address"),
        amount: z.number().positive().describe("Amount to send (in token units)"),
        decimals: z.number().int().positive().describe("Token decimals (e.g., 6 for USDC)"),
    }),
) {}
