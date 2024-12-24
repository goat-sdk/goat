import { Tool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { IonicSdk, AssetConfig } from "@ionicprotocol/sdk";
import { z } from "zod";
import { parseUnits, formatUnits } from "viem";
import type { HealthMetrics } from "./types";

// Parameter schemas with improved type safety
const supplyAssetSchema = z.object({
    poolId: z.string().describe("The ID of the pool to supply to"),
    asset: z.string().describe("The asset symbol to supply (e.g., USDC, WETH)"),
    amount: z.string().describe("The amount to supply in base units"),
});

const borrowAssetSchema = z.object({
    poolId: z.string().describe("The ID of the pool to borrow from"),
    asset: z.string().describe("The asset symbol to borrow"),
    amount: z.string().describe("The amount to borrow in base units"),
});

const getHealthMetricsSchema = z.object({
    poolId: z.string().describe("The ID of the Ionic Protocol pool"),
});

export class IonicTools {
    constructor() { }

    private initSdk(walletClient: EVMWalletClient): IonicSdk {
        return new IonicSdk(
            walletClient.publicClient,
            walletClient.walletClient,
            { chainId: walletClient.chainId }
        );
    }

    @Tool({
        name: "ionic_supply_asset",
        description: "Supply an asset to an Ionic Protocol pool"
    })
    async supplyAsset(walletClient: EVMWalletClient, parameters: z.infer<typeof supplyAssetSchema>) {
        const validatedParams = supplyAssetSchema.parse(parameters);
        const { poolId, asset, amount } = validatedParams;

        const sdk = this.initSdk(walletClient);
        const pool = await sdk.fetchPoolData(poolId);

        // Fixed the implicit 'any' type by explicitly typing the parameter
        const assetConfig = pool.assets.find((a: AssetConfig) => a.symbol === asset);
        if (!assetConfig) {
            throw new Error(`Asset ${asset} not found in pool ${poolId}`);
        }

        const amountBigInt = parseUnits(amount, assetConfig.decimals);

        const tx = await sdk.supply(
            walletClient.account.address,
            poolId,
            assetConfig.address,
            amountBigInt
        );

        return tx.hash as `0x${string}`;
    }

    @Tool({
        name: "ionic_borrow_asset",
        description: "Borrow an asset from an Ionic Protocol pool"
    })
    async borrowAsset(walletClient: EVMWalletClient, parameters: z.infer<typeof borrowAssetSchema>) {
        const validatedParams = borrowAssetSchema.parse(parameters);
        const { poolId, asset, amount } = validatedParams;

        const sdk = this.initSdk(walletClient);
        const pool = await sdk.fetchPoolData(poolId);
        
        // Fixed the implicit 'any' type by explicitly typing the parameter
        const assetConfig = pool.assets.find((a: AssetConfig) => a.symbol === asset);
        if (!assetConfig) {
            throw new Error(`Asset ${asset} not found in pool ${poolId}`);
        }

        const amountBigInt = parseUnits(amount, assetConfig.decimals);

        const tx = await sdk.borrow(
            walletClient.account.address,
            poolId,
            assetConfig.address,
            amountBigInt
        );

        return tx.hash as `0x${string}`;
    }

    @Tool({
        name: "ionic_get_health_metrics",
        description: "Get health metrics for a position in an Ionic Protocol pool"
    })
    async getHealthMetrics(walletClient: EVMWalletClient, parameters: z.infer<typeof getHealthMetricsSchema>): Promise<HealthMetrics> {
        const validatedParams = getHealthMetricsSchema.parse(parameters);
        const { poolId } = validatedParams;

        const sdk = this.initSdk(walletClient);
        const pool = await sdk.fetchPoolData(poolId);
        const assetPerformance: HealthMetrics['assetPerformance'] = {};

        let totalSuppliedUSD = 0n;
        let totalBorrowedUSD = 0n;

        for (const asset of pool.assets) {
            totalSuppliedUSD += asset.totalSupplyUSD;
            totalBorrowedUSD += asset.totalBorrowUSD;

            assetPerformance[asset.symbol] = {
                apy: Number(formatUnits(asset.supplyAPY, 18)),
                tvl: Number(formatUnits(asset.totalSupply, asset.decimals)),
                utilization: Number(formatUnits(asset.utilization, 18))
            };
        }

        const ltv = totalSuppliedUSD > 0n
            ? Number((totalBorrowedUSD * 100n) / totalSuppliedUSD)
            : 0;

        let liquidationRisk: HealthMetrics['liquidationRisk'] = "LOW";
        if (ltv > 80) {
            liquidationRisk = "HIGH";
        } else if (ltv > 65) {
            liquidationRisk = "MEDIUM";
        }

        return {
            ltv,
            liquidationRisk,
            assetPerformance
        };
    }
}

// Export parameter types
export type SupplyAssetParams = z.infer<typeof supplyAssetSchema>;
export type BorrowAssetParams = z.infer<typeof borrowAssetSchema>;
export type GetHealthMetricsParams = z.infer<typeof getHealthMetricsSchema>;