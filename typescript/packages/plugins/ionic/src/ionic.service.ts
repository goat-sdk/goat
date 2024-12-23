import { 
    type Address,
    type Abi
} from 'viem';
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { Tool } from "@goat-sdk/core";
import { z } from "zod";
import { COMPTROLLER_ABI } from "./abi";

interface HealthMetrics {
    ltv: number;
    liquidationRisk: 'LOW' | 'MEDIUM' | 'HIGH';
    assetPerformance: Record<string, any>;
}

export class IonicService {
    private static readonly supplySchema = z.object({
        poolId: z.string().describe("The ID of the pool to supply to"),
        asset: z.string().describe("The asset address to supply"),
        amount: z.string().describe("The amount to supply in base units"),
    });

    private static readonly healthSchema = z.object({
        poolId: z.string().describe("The pool ID to check metrics for"),
    });

    @Tool({
        name: "ionic_supply_asset",
        description: "Supply an asset to an Ionic Protocol pool"
    })
    async supplyAsset(
        walletClient: EVMWalletClient,
        parameters: z.infer<typeof IonicService.supplySchema>
    ) {
        const { poolId, asset, amount } = parameters;
        const amountBigInt = BigInt(amount);
        const userAddress = await walletClient.resolveAddress('');

        // Use the abstracted wallet client's sendTransaction method
        return await walletClient.sendTransaction({
            to: poolId,
            abi: COMPTROLLER_ABI as Abi,
            functionName: 'supply',
            args: [asset as Address, amountBigInt, userAddress as Address],
            value: 0n
        });
    }
    
    @Tool({
        name: "ionic_get_health_metrics",
        description: "Get health metrics for Ionic Protocol positions"
    })
    async getHealthMetrics(
        walletClient: EVMWalletClient,
        parameters: z.infer<typeof IonicService.healthSchema>
    ): Promise<HealthMetrics> {
        const { poolId } = parameters;
        const userAddress = await walletClient.resolveAddress('');
    
        // Use the abstracted wallet client's read method
        const result = await walletClient.read({
            address: poolId,
            abi: COMPTROLLER_ABI as Abi,
            functionName: 'getAccountLiquidity',
            args: [userAddress as Address]
        });
    
        const [error, liquidity, shortfall] = result.value as [bigint, bigint, bigint];
    
        if (error !== 0n) {
            throw new Error(`Failed to get account positions: error ${error}`);
        }
    
        const ltv = shortfall > 0n ? 100 : Number(liquidity) / Number(shortfall) * 100;
        const liquidationRisk = shortfall > 0n ? "HIGH" : 
                               liquidity > shortfall * 2n ? "LOW" : "MEDIUM";
    
        return {
            ltv,
            liquidationRisk,
            assetPerformance: {}
        };
    }
}