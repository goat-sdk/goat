import { Tool } from "@goat-sdk/core";
import type { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { parseUnits } from "viem";
import { ROUTER_ABI } from "./abi/router";
import { SwapExactTokensParams, AddLiquidityParams } from "./parameters";

const ROUTER_ADDRESS = "0xa062aE8A9c5e11aaA026fc2670B0D65cCc8B2858";
const POOL_FACTORY = "0xF1046053aa5682b4F9a81b5481394DA16BE5FF5a";

export class VelodromeService {
    @Tool({
        name: "swap_exact_tokens",
        description: "Swap an exact amount of tokens on Velodrome",
    })
    async swapExactTokens(walletClient: EVMWalletClient, parameters: SwapExactTokensParams) {
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes

        const amountIn = parseUnits(parameters.amountIn, parameters.tokenInDecimals);
        const amountOutMin = parseUnits(parameters.amountOutMin, parameters.tokenOutDecimals);

        const routes = [{
            from: parameters.tokenIn,
            to: parameters.tokenOut,
            stable: false
        }];

        const hash = await walletClient.sendTransaction({
            to: ROUTER_ADDRESS,
            abi: ROUTER_ABI,
            functionName: "swapExactTokensForTokens",
            args: [
                amountIn,
                amountOutMin,
                routes,
                parameters.to || walletClient.getAddress(),
                deadline,
            ],
        });

        return hash.hash;
    }

    @Tool({
        name: "add_liquidity",
        description: "Add liquidity to a Velodrome pool",
    })
    async addLiquidity(walletClient: EVMWalletClient, parameters: AddLiquidityParams) {
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes

        const amount0Desired = parseUnits(parameters.amount0Desired, parameters.token0Decimals);
        const amount1Desired = parseUnits(parameters.amount1Desired, parameters.token1Decimals);
        const amount0Min = parseUnits(parameters.amount0Min, parameters.token0Decimals);
        const amount1Min = parseUnits(parameters.amount1Min, parameters.token1Decimals);

        const hash = await walletClient.sendTransaction({
            to: ROUTER_ADDRESS,
            abi: ROUTER_ABI,
            functionName: "addLiquidity",
            args: [
                parameters.token0,
                parameters.token1,
                parameters.stable,
                amount0Desired,
                amount1Desired,
                amount0Min,
                amount1Min,
                parameters.to || walletClient.getAddress(),
                deadline,
            ],
        });

        return hash.hash;
    }
} 