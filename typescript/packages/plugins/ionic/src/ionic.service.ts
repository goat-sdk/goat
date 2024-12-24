import { Tool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { z } from "zod";
import { parseUnits, formatUnits, Abi, Address } from "viem";
import type { HealthMetrics } from "./types";
import { ionicProtocolAddresses } from "./config";
import * as ComptrollerABIImport from "./abis/Comptroller.json";
import * as PoolABIImport from "./abis/Pool.json";
import * as ERC20ABIImport from "./abis/ERC20.json";
import * as PoolDirectoryABIImport from "./abis/PoolDirectory.json";
import * as PoolLensABIImport from "./abis/PoolLens.json";
import * as SimplePriceOracleABIImport from "./abis/SimplePriceOracle.json";
import type { Chain } from "@goat-sdk/core";

const ComptrollerABI = ComptrollerABIImport as unknown as Abi;
const PoolABI = PoolABIImport as unknown as Abi;
const ERC20ABI = ERC20ABIImport as unknown as Abi;
const PoolDirectoryABI = PoolDirectoryABIImport as unknown as Abi;
const PoolLensABI = PoolLensABIImport as unknown as Abi;
const SimplePriceOracleABI = SimplePriceOracleABIImport as unknown as Abi;

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

            const allowanceResult = await walletClient.read({
                address: assetConfig.address,
                abi: ERC20ABI,
                functionName: 'allowance',
                args: [walletClient.account.address, poolAddress]
            });

            const allowance = BigInt(allowanceResult.toString());

            if (allowance < amountBigInt) {
                const approveTx = await walletClient.sendTransaction({
                    to: assetConfig.address,
                    abi: ERC20ABI,
                    functionName: 'approve',
                    args: [poolAddress, amountBigInt]
                });
                const approveHash = approveTx.hash as `0x${string}`;
                await walletClient.publicClient.waitForTransactionReceipt({
                    hash: approveHash
                });
            }

            const supplyTx = await walletClient.sendTransaction({
                to: poolAddress,
                abi: PoolABI,
                functionName: 'supply',
                args: [assetConfig.address, amountBigInt]
            });
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
            const poolDirectoryAddress = ionicProtocolAddresses[chainId]?.PoolDirectory as Address;
            if (!poolDirectoryAddress) {
                throw new Error(`PoolDirectory address not found for chain ID ${chainId}`);
            }
            const poolDataRaw = await walletClient.read({
                address: poolDirectoryAddress,
                abi: PoolDirectoryABI,
                functionName: 'pools',
                args: [BigInt(poolId)],
            });
            const poolData = poolDataRaw.value as [bigint, boolean, Address]; 
            const comptrollerAddress = poolData[2];
            if (!comptrollerAddress || comptrollerAddress === '0x0000000000000000000000000000000000000000') {
                throw new Error(`Comptroller address not found for pool ID ${poolId}`);
            }

            const comptrollerContract = {
                address: comptrollerAddress,
                abi: ComptrollerABI,
            };

            const poolContract = {
                address: poolAddress,
                abi: PoolABI,
            };

            const poolLensAddress = ionicProtocolAddresses[chainId]?.PoolLens as Address;
            if (!poolLensAddress) {
                throw new Error(`PoolLens address not found for chain ID ${chainId}`);
            }
            const poolLensContract = {
                address: poolLensAddress,
                abi: PoolLensABI,
            };

            const accountAddress = walletClient.account.address;
            const assetPerformance: HealthMetrics['assetPerformance'] = {};
            let totalBorrowedValue = 0;
            let totalCollateralValue = 0;

            const marketsResultRaw = await walletClient.read({
                ...comptrollerContract,
                functionName: 'getAssetsIn',
                args: [poolAddress],
            });
            const marketAddresses = marketsResultRaw.value as Address[]; // Use .value
            const apiKey = 'YOUR_SUPABASE_CLIENT_ANON_KEY';
            const baseURL = 'https://uoagtjstsdrjypxlkuzr.supabase.co/rest/v1/asset-total-apy';

            for (const marketAddress of marketAddresses) {
                const assetConfig = Object.values(ionicProtocolAddresses[chainId]?.assets || {}).find(config => config.address === marketAddress);
                if (!assetConfig || assetConfig.decimals === undefined) continue;
                const symbol = Object.keys(ionicProtocolAddresses[chainId]?.assets || {}).find(key => ionicProtocolAddresses[chainId]?.assets[key]?.address === marketAddress);
                if (!symbol) continue;

                const underlyingAddress = Object.entries(ionicProtocolAddresses[chainId]?.assets || {}).find(([key, config]) => config.address === marketAddress)?.[1]?.address;
                if (!underlyingAddress) {
                    console.warn(`Underlying address not found for ${symbol} (${marketAddress})`);
                    continue;
                }

                const supplyBalanceRaw = await walletClient.read({ ...poolContract, functionName: 'supplyBalanceOf', args: [marketAddress, accountAddress] });
                const borrowBalanceRaw = await walletClient.read({ ...poolContract, functionName: 'borrowBalanceOf', args: [marketAddress, accountAddress] });
                const supplyBalance = parseFloat(formatUnits(BigInt(supplyBalanceRaw.toString()), assetConfig.decimals));
                const borrowBalance = parseFloat(formatUnits(BigInt(borrowBalanceRaw.toString()), assetConfig.decimals));

                const marketDetails = await walletClient.read({ ...comptrollerContract, functionName: 'markets', args: [marketAddress] }) as any;
                const collateralFactorMantissa = BigInt(marketDetails.collateralFactorMantissa?.toString() || "0");
                const liquidationThresholdMantissa = BigInt(marketDetails.liquidationThresholdMantissa?.toString() || "0");

                let assetPrice: number = 0;
                try {
                    const oracleAddressRaw = await walletClient.read({
                        ...comptrollerContract,
                        functionName: 'oracle',
                    });
                    const oracleAddress = oracleAddressRaw.value as Address; // Use .value

                    const simplePriceOracleContract = {
                        address: oracleAddress,
                        abi: SimplePriceOracleABI,
                    };

                    const assetPriceRaw = await walletClient.read({
                        ...simplePriceOracleContract,
                        functionName: 'assetPrices',
                        args: [marketAddress],
                    });
                    assetPrice = parseFloat(formatUnits(BigInt(assetPriceRaw.toString()), 18));
                } catch (priceError) {
                    console.error(`Error fetching price for ${symbol} (${marketAddress}):`, priceError);
                    continue;
                }

                let supplyApy: number = 0;
                let borrowApy: number = 0;
                const apyApiUrl = `${baseURL}?chain_id=eq.${chainId}&underlying_address=eq.${underlyingAddress}`;
                try {
                    const response = await fetch(apyApiUrl, {
                        headers: {
                            'apikey': apiKey,
                            'Authorization': `Bearer ${apiKey}`,
                        },
                    });

                    if (!response.ok) {
                        console.error(`Failed to fetch APY for ${symbol} (${underlyingAddress}): ${response.status} ${response.statusText}`);
                    } else {
                        const apyData = await response.json();
                        if (apyData && apyData.length > 0) {
                            supplyApy = parseFloat(apyData[0].supplyApy || "0");
                            borrowApy = parseFloat(apyData[0].borrowApy || "0");
                        } else {
                            console.warn(`APY data not found for ${symbol} (${underlyingAddress})`);
                        }
                    }
                } catch (error) {
                    console.error(`Error fetching APY for ${symbol} (${underlyingAddress}):`, error);
                }

                const supplyValue = supplyBalance * assetPrice;
                const borrowValue = borrowBalance * assetPrice;
                const collateralValue = supplyValue * Number(formatUnits(collateralFactorMantissa, 18));

                totalBorrowedValue += borrowValue;
                totalCollateralValue += collateralValue;

                let tvl: number = 0;
                let utilization: number = 0;
                try {
                    const poolAssetsDataRaw = await walletClient.read({
                        ...poolLensContract,
                        functionName: 'getPoolAssetsWithData',
                        args: [comptrollerAddress],
                    });

                    // Type for the PoolAsset struct from the ABI
                    type PoolAsset = {
                        cToken: Address;
                        underlyingToken: Address;
                        underlyingName: string;
                        underlyingSymbol: string;
                        underlyingDecimals: bigint;
                        underlyingBalance: bigint;
                        supplyRatePerBlock: bigint;
                        borrowRatePerBlock: bigint;
                        totalSupply: bigint;
                        totalBorrow: bigint;
                        supplyBalance: bigint;
                        borrowBalance: bigint;
                        liquidity: bigint;
                        membership: boolean;
                        exchangeRate: bigint;
                        underlyingPrice: bigint;
                        oracle: Address;
                        collateralFactor: bigint;
                        reserveFactor: bigint;
                        adminFee: bigint;
                        ionicFee: bigint;
                        borrowGuardianPaused: boolean;
                        mintGuardianPaused: boolean;
                    };

                    const poolAssetsData = poolAssetsDataRaw.value as PoolAsset[];
                    const assetData = poolAssetsData.find((asset: PoolAsset) => asset.cToken === marketAddress);

                    if (assetData) {
                        tvl = Number(formatUnits(assetData.totalSupply, assetConfig.decimals)) * assetPrice;
                        const totalBorrows = assetData.totalBorrow;
                        const totalSupply = assetData.totalSupply;
                        utilization = totalSupply > 0n ? Number(totalBorrows) / Number(totalSupply) * 100 : 0;
                    } else {
                        console.warn(`Asset data not found in PoolLens for ${symbol} (${marketAddress})`);
                    }
                } catch (error) {
                    console.error(`Error fetching TVL/Utilization for ${symbol} (${marketAddress}):`, error);
                }

                assetPerformance[symbol] = {
                    apy: supplyApy,
                    tvl: tvl,
                    utilization: utilization,
                };
            }

            const ltv = totalCollateralValue > 0 ? (totalBorrowedValue / totalCollateralValue) * 100 : 0;

            const liquidityResultRaw = await walletClient.read({ ...comptrollerContract, functionName: 'getAccountLiquidity', args: [accountAddress] }) as any;
            const shortfall = BigInt(liquidityResultRaw[1]?.toString() || "0");

            let liquidationRisk: "LOW" | "MEDIUM" | "HIGH" = "LOW";
            if (shortfall > 0) {
                liquidationRisk = "HIGH";
            } else if (ltv > 80) {
                liquidationRisk = "MEDIUM";
            }

            const healthMetrics: HealthMetrics = {
                ltv: ltv,
                liquidationRisk: liquidationRisk,
                assetPerformance: assetPerformance,
            };

            return healthMetrics;

        } catch (error: any) {
            throw new Error(`Failed to get health metrics: ${error.message}`);
        }
    }
}

export type SupplyAssetParams = z.infer<typeof supplyAssetSchema>;
export type BorrowAssetParams = z.infer<typeof borrowAssetSchema>;
export type GetHealthMetricsParams = z.infer<typeof getHealthMetricsSchema>;