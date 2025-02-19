import { Tool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { ERC20_ABI } from "./abi/erc20abi";
import { factoryAbi } from "./abi/factoryabi";
import { quoterv2abi } from "./abi/quoterv2abi";
import { swaprouterabi } from "./abi/swaprouterabi";
import { POSITION_MANAGER_ABI } from "./abi/nftpositionmanager";
import { DragonswapConfig } from "./dragonswap.plugin";
import {
    AddLiquidityParameters,
    CollectFeesParameters,
    ExactInputSingleParameters,
    RemoveLiquidityParameters,
} from "./parameters";

export class DragonswapService {
    constructor(private readonly config: DragonswapConfig) {}

    @Tool({
        name: "swap_exact_input_single_on_dragonswap",
        description: "Swap tokens on Dragonswap using exact input amount",
    })
    async exactInputSingle(walletClient: EVMWalletClient, parameters: ExactInputSingleParameters) {
        // Approve token if needed
        await walletClient.sendTransaction({
            to: parameters.tokenIn as `0x${string}`,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [this.config.routerAddress, parameters.amountIn],
        });

        const connectedaddress = await walletClient.getAddress();

        const tx = await walletClient.sendTransaction({
            to: this.config.routerAddress as `0x${string}`,
            abi: swaprouterabi,
            functionName: "exactInputSingle",
            args: [{
                tokenIn: parameters.tokenIn,
                tokenOut: parameters.tokenOut,
                fee: parameters.fee,
                recipient: parameters.recipient || connectedaddress,
                deadline: parameters.deadline,
                amountIn: parameters.amountIn,
                amountOutMinimum: parameters.amountOutMinimum,
                sqrtPriceLimitX96: parameters.sqrtPriceLimitX96 || 0,
            }],
        });

        return tx.hash;
    }

    @Tool({
        name: "get_quote_from_dragonswap",
        description: "Get quote for a swap on Dragonswap",
    })
    async getQuote(walletClient: EVMWalletClient, parameters: ExactInputSingleParameters) {
        
        const quote = await walletClient.sendTransaction({
            to: this.config.quoterAddress as `0x${string}`,
            abi: quoterv2abi,
            functionName: "quoteExactInputSingle",
            args: [{
                tokenIn: parameters.tokenIn,
                tokenOut: parameters.tokenOut,
                amountIn: parameters.amountIn,
                fee: parameters.fee,
                sqrtPriceLimitX96: parameters.sqrtPriceLimitX96 || 0,
            }],
        }) as any as { amountOut: string, sqrtPriceX96After: string, initializedTicksCrossed: boolean, gasEstimate: string };

        console.log("quote amountout", quote.amountOut.toString());
        return {
            amountOut: quote.amountOut.toString(),
            sqrtPriceX96After: quote.sqrtPriceX96After.toString(),
            initializedTicksCrossed: quote.initializedTicksCrossed,
            gasEstimate: quote.gasEstimate.toString(),
        };
    }

    @Tool({
        name: "add_liquidity_to_dragonswap",
        description: "Add liquidity to Dragonswap pool",
    })
    async addLiquidity(walletClient: EVMWalletClient, parameters: AddLiquidityParameters) {
        // Approve tokens
        await walletClient.sendTransaction({
            to: parameters.token0 as `0x${string}`,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [this.config.nonfungiblePositionManagerAddress, parameters.amount0Desired],
        });

        await walletClient.sendTransaction({
            to: parameters.token1 as `0x${string}`,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [this.config.nonfungiblePositionManagerAddress, parameters.amount1Desired],
        });

        // Add liquidity
        const tx = await walletClient.sendTransaction({
            to: this.config.nonfungiblePositionManagerAddress as `0x${string}`,
            abi: POSITION_MANAGER_ABI,
            functionName: "mint",
            args: [{
                token0: parameters.token0,
                token1: parameters.token1,
                fee: parameters.fee,
                tickLower: parameters.tickLower,
                tickUpper: parameters.tickUpper,
                amount0Desired: parameters.amount0Desired,
                amount1Desired: parameters.amount1Desired,
                amount0Min: parameters.amount0Min,
                amount1Min: parameters.amount1Min,
                recipient: parameters.recipient,
                deadline: parameters.deadline,
            }],
        });

        return tx.hash;
    }

    @Tool({
        name: "remove_liquidity_from_dragonswap",
        description: "Remove liquidity from Dragonswap pool",
    })
    async removeLiquidity(walletClient: EVMWalletClient, parameters: RemoveLiquidityParameters) {
        const tx = await walletClient.sendTransaction({
            to: this.config.nonfungiblePositionManagerAddress as `0x${string}`,
                abi: POSITION_MANAGER_ABI,
                functionName: "decreaseLiquidity",
                args: [{
                    tokenId: parameters.tokenId,
                    liquidity: parameters.liquidity,
                    amount0Min: parameters.amount0Min,
                    amount1Min: parameters.amount1Min,
                    deadline: parameters.deadline,
                }],
            });

        return tx.hash;
    }

    @Tool({
        name: "collect_fees_from_dragonswap",
        description: "Collect fees from a Dragonswap position",
    })
    async collectFees(walletClient: EVMWalletClient, parameters: CollectFeesParameters) {

        const tx = await walletClient.sendTransaction({
            to: this.config.nonfungiblePositionManagerAddress as `0x${string}`,
            functionName: "collect",
            args: [{
                tokenId: parameters.tokenId,
                recipient: parameters.recipient,
                amount0Max: parameters.amount0Max,
                amount1Max: parameters.amount1Max,
            }],
            abi: POSITION_MANAGER_ABI,
        });

        return tx.hash;
    }
}
