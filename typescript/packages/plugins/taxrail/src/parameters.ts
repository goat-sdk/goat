import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

export class CheckTaxImpactParameters extends createToolParameters(
    z.object({
        walletAddress: z
            .string()
            .regex(/^0x[a-fA-F0-9]{40}$/)
            .describe("EVM wallet address (0x...) holding the token to sell or swap"),
        targetAsset: z.string().min(1).describe("Token symbol to sell or swap (e.g. ETH, AERO, WBTC)"),
        sellQuantity: z.number().positive().describe("Positive token quantity to dispose"),
        chain: z
            .enum(["base", "ethereum", "arbitrum", "solana"])
            .default("base")
            .describe("Chain holding the lots"),
        jurisdiction: z
            .enum(["US", "BR"])
            .default("US")
            .describe("Tax jurisdiction: US (IRS 1099-DA) or BR (Lei 14.754 / R$35k rule)"),
    }),
) {}

export class CompareBorrowVsSellParameters extends createToolParameters(
    z.object({
        jurisdiction: z.enum(["US", "BR"]).default("US").describe("Tax jurisdiction"),
        chain: z.enum(["base", "ethereum", "arbitrum"]).default("base").describe("Aave v3 network"),
        collateralAsset: z.string().min(1).describe("Collateral token symbol (e.g. ETH, cbBTC)"),
        collateralAmount: z.number().positive().describe("Collateral token amount"),
        collateralPriceUsd: z.number().positive().describe("Spot price per token in USD"),
        collateralCostBasisUsd: z.number().nonnegative().describe("Cost basis per token in USD"),
        liquidityNeededUsd: z.number().positive().describe("USDC liquidity needed in USD"),
        holdingDays: z.number().nonnegative().default(180).describe("Days collateral has been held"),
    }),
) {}

export class CheckBr35kStatusParameters extends createToolParameters(
    z.object({
        monthlySalesBrl: z.number().nonnegative().default(0).describe("Monthly BRL sales already executed"),
        plannedSaleUsd: z.number().nonnegative().describe("Planned next crypto sale value in USD"),
        custodyLocation: z
            .enum(["DOMESTIC", "OFFSHORE"])
            .default("DOMESTIC")
            .describe("DOMESTIC (Brazil licensed exchange) or OFFSHORE (DEX / self-custody)"),
        paymentSignature: z
            .string()
            .optional()
            .describe("Optional x402 PAYMENT-SIGNATURE header ($0.005 USDC on Base)"),
    }),
) {}
