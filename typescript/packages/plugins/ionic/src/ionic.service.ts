import { Tool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { z } from "zod";
import { parseUnits, formatUnits, Abi, Address } from "viem";
import type { HealthMetrics } from "./types";
import { ionicProtocolAddresses } from "./config";
import * as ComptrollerABIImport from "./abis/Comptroller.json";
import * as PoolABIImport from "./abis/Pool.json";
import * as ERC20ABIImport from "./abis/ERC20.json";
import type { Chain } from "@goat-sdk/core";

// Properly type the imported ABIs
const ComptrollerABI = ComptrollerABIImport as unknown as Abi;
const PoolABI = PoolABIImport as unknown as Abi;
const ERC20ABI = ERC20ABIImport as unknown as Abi;

// Parameter schemas
const supplyAssetSchema = z.object({
    poolId: z.string(),
    asset: z.string(),
    amount: z.string()
});

const borrowAssetSchema = z.object({
    poolId: z.string(),
    asset: z.string(),
    amount: z.string()
});

const getHealthMetricsSchema = z.object({
    poolId: z.string()
});

export class IonicTools {
    constructor() {}

    private async getAssetConfig(chainId: number, symbol: string): Promise<{ address: Address, decimals: number }> {
        const config = ionicProtocolAddresses[chainId]?.assets?.[symbol];
        if (!config?.address || config.decimals === undefined) {
            throw new Error(`Asset ${symbol} not found in Ionic Protocol addresses for chain ${chainId}`);
        }
        return { address: config.address as Address, decimals: config.decimals };
    }

    @Tool({
        name: "supply_asset",
        description: "Supply an asset to an Ionic Protocol pool"
    })
    async supplyAsset(walletClient: EVMWalletClient, parameters: z.infer<typeof supplyAssetSchema>) {
        const validatedParams = supplyAssetSchema.parse(parameters);
        const { poolId, asset, amount } = validatedParams;
        
        const chainId = walletClient.chainId;
        const poolAddress = ionicProtocolAddresses[chainId]?.pools[poolId] as Address;

        if (!poolAddress) {
            throw new Error(`Pool with ID ${poolId} not found for chain ID ${chainId}`);
        }

        try {
            const assetConfig = await this.getAssetConfig(chainId, asset);
            const amountBigInt = parseUnits(amount, assetConfig.decimals);

            // Check allowance - properly handle bigint comparison
            const allowanceResult = await walletClient.read({
                address: assetConfig.address,
                abi: ERC20ABI,
                functionName: 'allowance',
                args: [walletClient.account.address, poolAddress]
            });
            
            const allowance = BigInt(allowanceResult.toString());
            
            if (allowance < amountBigInt) {
                // Properly type the transaction hash
                const approveTx = await walletClient.sendTransaction({
                    to: assetConfig.address,
                    abi: ERC20ABI,
                    functionName: 'approve',
                    args: [poolAddress, amountBigInt]
                });
                
                // Ensure the hash is properly typed as `0x${string}`
                const approveHash = approveTx.hash as `0x${string}`;
                
                await walletClient.publicClient.waitForTransactionReceipt({
                    hash: approveHash
                });
            }

            // Handle the supply transaction with proper hash typing
            const supplyTx = await walletClient.sendTransaction({
                to: poolAddress,
                abi: PoolABI,
                functionName: 'supply',
                args: [assetConfig.address, amountBigInt]
            });

            // Ensure we return a properly typed hash
            return supplyTx.hash as `0x${string}`;
        } catch (error: any) {
            throw new Error(`Failed to supply asset: ${error.message}`);
        }
    }

    @Tool({
        name: "borrow_asset",
        description: "Borrow an asset from an Ionic Protocol pool"
    })
    async borrowAsset(walletClient: EVMWalletClient, parameters: z.infer<typeof borrowAssetSchema>) {
        const validatedParams = borrowAssetSchema.parse(parameters);
        const { poolId, asset, amount } = validatedParams;
        
        const chainId = walletClient.chainId;
        const poolAddress = ionicProtocolAddresses[chainId]?.pools[poolId] as Address;

        if (!poolAddress) {
            throw new Error(`Pool with ID ${poolId} not found for chain ID ${chainId}`);
        }

        try {
            const assetConfig = await this.getAssetConfig(chainId, asset);
            const amountBigInt = parseUnits(amount, assetConfig.decimals);

            const borrowTx = await walletClient.sendTransaction({
                to: poolAddress,
                abi: PoolABI,
                functionName: 'borrow',
                args: [assetConfig.address, amountBigInt]
            });

            // Ensure we return a properly typed hash
            return borrowTx.hash as `0x${string}`;
        } catch (error: any) {
            throw new Error(`Failed to borrow asset: ${error.message}`);
        }
    }

    @Tool({
        name: "get_health_metrics",
        description: "Get health metrics for a pool position"
    })
    async getHealthMetrics(walletClient: EVMWalletClient, parameters: z.infer<typeof getHealthMetricsSchema>): Promise<HealthMetrics> {
        const validatedParams = getHealthMetricsSchema.parse(parameters);
        const { poolId } = validatedParams;
        
        const chainId = walletClient.chainId;
        const poolAddress = ionicProtocolAddresses[chainId]?.pools[poolId] as Address;

        if (!poolAddress) {
            throw new Error(`Pool with ID ${poolId} not found for chain ID ${chainId}`);
        }

        try {
            // Implementation for getting health metrics
            // You'll need to add the specific metrics calculation based on your requirements
            return {
                // Add your health metrics properties here
            } as HealthMetrics;
        } catch (error: any) {
            throw new Error(`Failed to get health metrics: ${error.message}`);
        }
    }
}

// Export parameter types
export type SupplyAssetParams = z.infer<typeof supplyAssetSchema>;
export type BorrowAssetParams = z.infer<typeof borrowAssetSchema>;
export type GetHealthMetricsParams = z.infer<typeof getHealthMetricsSchema>;