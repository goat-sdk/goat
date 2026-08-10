import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

/**
 * Assets the signal covers. `ETH_STAKING` is liquid staking on Ethereum
 * mainnet; `USDC`/`WETH` are lending markets on Base.
 */
const ALL_ASSETS = ["USDC", "WETH", "ETH_STAKING"] as const;

/**
 * The four analytics only cover lending markets. This is a measured limit, not
 * an omission: liquid staking has no utilization curve, no borrow side and no
 * itemized incentive component, so those reports would have nothing to compute.
 */
const LENDING_ASSETS = ["USDC", "WETH"] as const;

export class GetYieldSignalParameters extends createToolParameters(
    z.object({
        asset: z.enum(ALL_ASSETS).optional().default("USDC").describe("Asset to read the yield signal for"),
    }),
) {}

export class GetYieldDecisionParameters extends createToolParameters(
    z.object({
        asset: z.enum(ALL_ASSETS).optional().default("USDC").describe("Asset to evaluate"),
        position: z
            .string()
            .optional()
            .describe("Protocol where the capital sits now, or 'idle' if uninvested (eg. 'aave')"),
        amountUsd: z.number().optional().describe("Position size in USD. Scales the expected gain and the break-even"),
        moveCostUsd: z.number().optional().describe("Estimated cost to move, in USD (gas + slippage)"),
        horizonDays: z.number().optional().describe("Days the position is expected to be held before re-evaluating"),
    }),
) {}

/**
 * Each tool needs its OWN parameter class. GOAT resolves a tool's schema
 * through `design:paramtypes` reflection metadata, which only sees classes —
 * sharing one class across tools would make them all report the same schema.
 */
export class GetYieldDurabilityParameters extends createToolParameters(
    z.object({
        asset: z.enum(LENDING_ASSETS).optional().default("USDC").describe("Lending asset to decompose"),
    }),
) {}

export class GetRateSensitivityParameters extends createToolParameters(
    z.object({
        asset: z.enum(LENDING_ASSETS).optional().default("USDC").describe("Lending asset to read the curve for"),
    }),
) {}

export class GetExitCapacityParameters extends createToolParameters(
    z.object({
        asset: z.enum(LENDING_ASSETS).optional().default("USDC").describe("Lending asset to measure"),
        amountUsd: z
            .number()
            .optional()
            .describe("Size you would want to withdraw, in USD. Omit for utilization and free liquidity only"),
    }),
) {}

export class GetSharedExposureParameters extends createToolParameters(
    z.object({
        asset: z.enum(LENDING_ASSETS).optional().default("USDC").describe("Lending asset the positions are in"),
        positions: z
            .string()
            .describe("Your positions as 'protocol:usdAmount', comma separated (eg. 'aave:200000,morpho:150000')"),
    }),
) {}
