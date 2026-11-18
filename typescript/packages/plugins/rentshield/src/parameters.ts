import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

export class CheckTokenRugShieldParameters extends createToolParameters(
    z.object({
        mint: z
            .string()
            .min(32)
            .max(44)
            .describe("Public base58 Solana token mint address. Never pass private keys or seed phrases."),
    }),
) {}

export class ScanWalletRentParameters extends createToolParameters(
    z.object({
        wallet: z
            .string()
            .min(32)
            .max(44)
            .describe("Public base58 Solana wallet address. Never pass private keys or seed phrases."),
    }),
) {}
