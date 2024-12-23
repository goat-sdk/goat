// File: typescript/packages/plugins/ionic/src/types.ts
import { type Address } from "viem";
  
export interface HealthMetrics {
  ltv: number;
  liquidationRisk: "LOW" | "MEDIUM" | "HIGH";
  assetPerformance: {
    [asset: string]: {
      apy: number;
      tvl: number;
      utilization: number;
    };
  };
}

export interface SupplyPosition {
  asset: string;
  amount: bigint;
  value: bigint;
  apy: number;
}

export interface BorrowPosition {
  asset: string;
  amount: bigint;
  value: bigint;
  apy: number;
  collateral: boolean;
}

