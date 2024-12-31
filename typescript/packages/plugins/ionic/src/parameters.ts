import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

export class SupplyAssetParameters extends createToolParameters(
    z.object({
        poolId: z.string().describe("The ID of the pool to supply to"),
        asset: z.string().describe("The asset to supply (e.g. USDC, WETH)"),
        amount: z.string().describe("The amount to supply in base units"),
    }),
) {}

export class BorrowAssetParameters extends createToolParameters(
    z.object({
        asset: z.string().describe("The asset to borrow (e.g. USDC, WETH)"),
        amount: z.string().describe("The amount to borrow in base units"),
    }),
) {}

export class GetHealthMetricsParameters extends createToolParameters(
    z.object({
        poolId: z.string().describe("The pool ID to check metrics for"),
    }),
) {}

export class GetPoolDataParameters extends createToolParameters(
    z.object({
        poolId: z.string().describe("The pool ID to get data for"),
    }),
) {}

export class GetPoolAssetsParameters extends createToolParameters(
    z.object({
        poolId: z.string().describe("The pool ID to get assets for"),
    }),
) {}

export class GetPoolRatesParameters extends createToolParameters(
    z.object({
        poolId: z.string().describe("The pool ID to get rates for"),
        asset: z.string().describe("The asset to get rates for (e.g. USDC, WETH)"),
    }),
) {}

export class GetUserPositionParameters extends createToolParameters(
    z.object({
        poolId: z.string().describe("The pool ID to get position for"),
        user: z.string().describe("The user address to get position for"),
    }),
) {}
