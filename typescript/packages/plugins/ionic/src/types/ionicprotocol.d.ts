// src/types/ionicprotocol.d.ts

import type { providers } from "ethers";

declare module '@ionicprotocol/sdk' {
    export interface AssetConfig {
        symbol: string;
        address: string;
        decimals: number;
        totalSupplyUSD: bigint;
        totalBorrowUSD: bigint;
        supplyAPY: bigint;
        totalSupply: bigint;
        utilization: bigint;
    }

    export interface PoolData {
        assets: AssetConfig[];
        // Add other pool properties as needed
    }

    export class IonicSdk {
        constructor(
            provider: providers.Provider,
            chainId: number
        );

        fetchPoolData(poolId: string): Promise<PoolData>;

        supply(
            address: string,
            poolId: string,
            assetAddress: string,
            amount: bigint
        ): Promise<{
            hash: string;
            wait(): Promise<any>;
        }>;

        borrow(
            address: string,
            poolId: string,
            assetAddress: string,
            amount: bigint
        ): Promise<{
            hash: string;
            wait(): Promise<any>;
        }>;
    }
}