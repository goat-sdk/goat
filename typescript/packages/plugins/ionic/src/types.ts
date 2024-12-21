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

export interface LoopingConfig {
  maxLeverage: number;
  supportedAssets: string[];
  minCollateralUSD: number;
}

export interface SupplyPosition {
  asset: string;
  amount: string;
  value: string;
  apy: number;
}

export interface CollateralSwapConfig {
  slippageTolerance: number;
  maxSwapSize: number;
} 

export interface BorrowPosition {
  asset: string;
  amount: string;
  value: string;
  apy: number;
  collateral: boolean;
} 