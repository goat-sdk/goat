import { Tool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { IonicSdk } from "@ionicprotocol/sdk";
import { z } from "zod";
import { parseUnits, formatUnits } from "viem";
import type { HealthMetrics, SupplyPosition, BorrowPosition } from "./types";

export class IonicService {
  private sdk: IonicSdk;
  private supportedTokens: string[];

  constructor(chainId: number, supportedTokens?: string[]) {
    this.supportedTokens = supportedTokens || ["USDC", "WETH", "MODE"];
  }

  private initSdk(walletClient: EVMWalletClient) {
    if (!this.sdk) {
      this.sdk = new IonicSdk(
        walletClient.publicClient,
        walletClient.walletClient,
        {
          chainId: walletClient.chainId
        }
      );
    }
  }

  @Tool({
    name: "supply_asset",
    description: "Supply an asset to an Ionic Protocol pool",
    parameters: z.object({
      poolId: z.string().describe("The ID of the pool to supply to"),
      asset: z.string().describe("The asset to supply (e.g. USDC, WETH)"),
      amount: z.string().describe("The amount to supply"),
    }),
  })
  async supplyAsset(walletClient: EVMWalletClient, parameters: z.infer<typeof parameters>) {
    this.initSdk(walletClient);
    const { poolId, asset, amount } = parameters;
    
    const pool = await this.sdk.fetchPoolData(poolId);
    
    // Find the asset in the pool
    const assetConfig = pool.assets.find(a => a.symbol === asset);
    if (!assetConfig) {
      throw new Error(`Asset ${asset} not found in pool ${poolId}`);
    }

    // Convert amount to proper decimals
    const amountBigInt = parseUnits(amount, assetConfig.decimals);

    // Approve spending if needed
    await this.sdk.approve(
      walletClient.account.address,
      assetConfig.address,
      amountBigInt
    );

    // Supply asset to pool
    const tx = await this.sdk.supply(
      walletClient.account.address,
      poolId,
      assetConfig.address,
      amountBigInt
    );

    return tx.hash;
  }

  @Tool({
    name: "borrow_asset",
    description: "Borrow an asset from an Ionic Protocol pool",
    parameters: z.object({
      poolId: z.string().describe("The ID of the pool to borrow from"),
      asset: z.string().describe("The asset to borrow"),
      amount: z.string().describe("The amount to borrow"),
    }),
  })
  async borrowAsset(walletClient: EVMWalletClient, parameters: z.infer<typeof parameters>) {
    this.initSdk(walletClient);
    const { poolId, asset, amount } = parameters;

    const pool = await this.sdk.fetchPoolData(poolId);
    const assetConfig = pool.assets.find(a => a.symbol === asset);
    if (!assetConfig) {
      throw new Error(`Asset ${asset} not found in pool ${poolId}`);
    }

    const amountBigInt = parseUnits(amount, assetConfig.decimals);

    const tx = await this.sdk.borrow(
      walletClient.account.address,
      poolId,
      assetConfig.address,
      amountBigInt
    );

    return tx.hash;
  }

  @Tool({
    name: "get_health_metrics",
    description: "Get health metrics for a pool position",
    parameters: z.object({
      poolId: z.string().describe("The pool ID to check metrics for"),
    }),
  })
  async getHealthMetrics(walletClient: EVMWalletClient, parameters: z.infer<typeof parameters>): Promise<HealthMetrics> {
    this.initSdk(walletClient);
    const { poolId } = parameters;

    const pool = await this.sdk.fetchPoolData(poolId);
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