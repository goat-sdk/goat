import { Tool } from "@goat-sdk/core";
import { EVMTransactionOptions, EVMWalletClient } from "@goat-sdk/wallet-evm";
import { type Address, erc20Abi, formatUnits, parseUnits } from "viem";
import { z } from "zod";
import { ComptrollerProxyAbi } from "./abis/ComptrollerProxyAbi";
import { poolAbi } from "./abis/Pool";
import { poolLensAbi } from "./abis/PoolLens";
import { ionicProtocolAddresses } from "./ionic.config";
import { BorrowAssetParameters, GetHealthMetricsParameters, SupplyAssetParameters } from "./parameters";
import type { HealthMetrics } from "./types";

export class IonicService {
    private supportedTokens: string[];

    constructor(supportedTokens?: string[]) {
        this.supportedTokens = supportedTokens || Object.keys(ionicProtocolAddresses[34443].assets);
    }

    private async getAssetConfig(chainId: number, symbol: string): Promise<{ address: Address; decimals: number }> {
        const config = ionicProtocolAddresses[chainId]?.assets?.[symbol];
        if (!config?.address || config.decimals === undefined) {
            throw new Error(`Asset ${symbol} not found in Ionic Protocol addresses for chain ${chainId}`);
        }
        return { address: config.address as Address, decimals: config.decimals };
    }

    @Tool({
        name: "ionic_supply_asset",
        description: "Supply an asset to an Ionic Protocol pool",
    })
    async supplyAsset(wallet: EVMWalletClient, params: SupplyAssetParameters): Promise<string> {
        const { asset, amount } = params;
        const chain = await wallet.getChain();

        // approval is handled by the erc20 plugin

        // Get token address from config
        const tokenAddress = ionicProtocolAddresses[chain.id]?.assets?.[asset]?.address;
        if (!tokenAddress) {
            throw new Error(`Token address not found for ${asset} on chain ${chain.id}`);
        }

        // Then supply to pool
        const txn = await wallet.sendTransaction({
            to: tokenAddress,
            abi: poolAbi,
            functionName: "mint",
            args: [BigInt(amount)],
        });

        return txn.hash;
    }

    @Tool({
        name: "ionic_borrow_asset",
        description: "Borrow an asset from an Ionic Protocol pool",
    })
    async borrowAsset(wallet: EVMWalletClient, params: BorrowAssetParameters): Promise<string> {
        const { asset, amount } = params;
        const chain = await wallet.getChain();
        const { address } = await this.getAssetConfig(chain.id, asset);

        const comptrollerAddress = ionicProtocolAddresses[chain.id]?.Comptroller;
        if (!comptrollerAddress) throw new Error("Comptroller not found");
        ``;
        const tokenAddress = ionicProtocolAddresses[chain.id]?.assets?.[asset]?.address;
        if (!tokenAddress) {
            throw new Error(`Token address not found for ${asset} on chain ${chain.id}`);
        }

        // Check borrow allowed
        const borrowAllowed = await wallet.read({
            address: comptrollerAddress,
            abi: ComptrollerProxyAbi,
            functionName: "borrowAllowed",
            args: [address, await wallet.getAddress(), amount],
        });

        if (borrowAllowed.toString() !== "0") {
            throw new Error(`Borrow not allowed: ${borrowAllowed}`);
        }

        // Execute borrow
        const txn = await wallet.sendTransaction({
            to: tokenAddress,
            abi: poolAbi,
            functionName: "borrow",
            args: [amount],
        });

        return txn.hash;
    }
}
