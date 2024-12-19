import type { Tool, WalletClient } from "@goat-sdk/core";
import { AddLiquidityParameters, SwapExactTokensForTokensParameters } from "./parameters";
import { KIM_ROUTER_ADDRESS, KIM_NFT_POSITION_MANAGER } from "./constants";
import { kimRouterABI, kimNFTPositionManagerABI } from "./abi";
import type { z } from "zod";

export async function getTools(wallet: WalletClient): Promise<Tool[]> {
    return [
        {
            name: "kim_swap_exact_tokens_for_tokens",
            description: "This {{tool}} swaps an exact amount of input tokens for output tokens on KIM Protocol",
            parameters: SwapExactTokensForTokensParameters,
            method: async (parameters: z.infer<typeof SwapExactTokensForTokensParameters>) => {
                const { tokenIn, tokenOut, amountIn, amountOutMinimum, recipient, deadline = Math.floor(Date.now() / 1000) + 1200, limitSqrtPrice = "0" } = parameters;
                
                const data = {
                    target: KIM_ROUTER_ADDRESS,
                    abi: kimRouterABI,
                    functionName: "exactInputSingle",
                    args: [{
                        tokenIn,
                        tokenOut,
                        recipient,
                        deadline,
                        amountIn,
                        amountOutMinimum,
                        limitSqrtPrice
                    }],
                };

                return wallet.writeContract(data);
            },
        },
        {
            name: "kim_add_liquidity",
            description: "This {{tool}} adds liquidity to a KIM Protocol pool",
            parameters: AddLiquidityParameters,
            method: async (parameters: z.infer<typeof AddLiquidityParameters>) => {
                const { 
                    token0,
                    token1,
                    tickLower,
                    tickUpper,
                    amount0Desired,
                    amount1Desired,
                    amount0Min,
                    amount1Min,
                    recipient,
                    deadline = Math.floor(Date.now() / 1000) + 1200 
                } = parameters;

                const data = {
                    target: KIM_NFT_POSITION_MANAGER,
                    abi: kimNFTPositionManagerABI,
                    functionName: "mint",
                    args: [{
                        token0,
                        token1,
                        tickLower,
                        tickUpper,
                        amount0Desired,
                        amount1Desired,
                        amount0Min,
                        amount1Min,
                        recipient,
                        deadline
                    }],
                };

                return wallet.writeContract(data);
            },
        },
    ];
} 