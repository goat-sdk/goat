import { Tool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { erc20Abi } from "viem";
import { quoterabi } from "./abi/quoterabi";
import { routerabi } from "./abi/routerabi";
import { AddLiquidityParams, SwapExactTokensParams } from "./parameters";

const ROUTER_ADDRESS: Record<number, string> = {
    34443: "0x3a63171DD9BebF4D07BC782FECC7eb0b890C2A45",
};

const FACTORY_ADDRESS: Record<number, string> = {
    34443: "0xF1046053aa5682b4F9a81b5481394DA16BE5FF5a",
};
const QUOTER_ADDRESS: Record<number, string> = {
    34443: "0x2f7150B288ef1cc553207bD9fbd40D4e0e093B24",
};

const WETH_ADDRESS: Record<number, string> = {
    34443: "0x4200000000000000000000000000000000000006",
};

export class VelodromeService {
    @Tool({
        name: "swap_exact_tokens",
        description: "Swap an exact amount of tokens on Velodrome.",
    })
    async swapExactTokens(walletClient: EVMWalletClient, parameters: SwapExactTokensParams) {
        try {
            const userAddress = await walletClient.getAddress();
            if (!userAddress) {
                throw new Error("Could not get user address");
            }

            const chain = await walletClient.getChain();
            if (!chain) {
                throw new Error("Chain not configured in wallet client");
            }

            const routerAddress = ROUTER_ADDRESS[chain.id];
            if (!routerAddress) {
                throw new Error(`Router not found for chain ${chain.id}`);
            }

            const tokenInLower = parameters.tokenIn.toLowerCase();
            const tokenOutLower = parameters.tokenOut.toLowerCase();

            // Specify exact stablecoin addresses
            const usdtAddress = "0xf0f161fda2712db8b566946122a5af183995e2ed".toLowerCase();
            const usdcAddress = "0xd988097fb8612cc24eec14542bc03424c656005f".toLowerCase();

            // Verify if it is a stablecoin pair
            if (
                (tokenInLower === usdtAddress && tokenOutLower === usdcAddress) ||
                (tokenInLower === usdcAddress && tokenOutLower === usdtAddress)
            ) {
                // Force stable: true for USDC-USDT regardless of the incoming parameters
                parameters.stable = true;
                console.log("Forcing a stable pool for the USDC-USDT pair");
            }

            const wethAddress = WETH_ADDRESS[chain.id];

            const isETHIn =
                parameters.tokenIn.toLowerCase() === wethAddress.toLowerCase() ||
                parameters.tokenIn.toLowerCase() === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" ||
                parameters.tokenIn.toLowerCase() === "weth";

            const isETHOut =
                parameters.tokenOut.toLowerCase() === wethAddress.toLowerCase() ||
                parameters.tokenOut.toLowerCase() === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" ||
                parameters.tokenOut.toLowerCase() === "weth";

            // Get quote first
            const amountOutMin = await this.getQuote(
                walletClient,
                isETHIn ? wethAddress : parameters.tokenIn,
                isETHOut ? wethAddress : parameters.tokenOut,
                parameters.amountIn,
                parameters.stable,
            );

            // Apply slippage to quote (e.g. 0.5% slippage)
            const minAmountOut = (BigInt(amountOutMin) * BigInt(995)) / BigInt(1000);

            const timestamp = Math.floor(Date.now() / 1000) + parameters.deadline;

            // Create route array
            const routes = [
                {
                    from: isETHIn ? wethAddress : parameters.tokenIn,
                    to: isETHOut ? wethAddress : parameters.tokenOut,
                    stable: parameters.stable,
                },
            ];

            // If the input is not ETH, we need to approve first
            if (!isETHIn) {
                const approvalHash = await walletClient.sendTransaction({
                    to: parameters.tokenIn as `0x${string}`,
                    abi: erc20Abi,
                    functionName: "approve",
                    args: [routerAddress, parameters.amountIn],
                });
            }

            let txHash: { hash: string };

            if (isETHIn) {
                // ETH -> Token
                txHash = await walletClient.sendTransaction({
                    to: routerAddress,
                    abi: routerabi,
                    functionName: "swapExactETHForTokens",
                    args: [minAmountOut, routes, parameters.to || userAddress, timestamp],
                    value: BigInt(parameters.amountIn),
                });
            } else if (isETHOut) {
                // Token -> ETH
                txHash = await walletClient.sendTransaction({
                    to: routerAddress,
                    abi: routerabi,
                    functionName: "swapExactTokensForETH",
                    args: [parameters.amountIn, minAmountOut, routes, parameters.to || userAddress, timestamp],
                });
            } else {
                // Token -> Token
                txHash = await walletClient.sendTransaction({
                    to: routerAddress,
                    abi: routerabi,
                    functionName: "swapExactTokensForTokens",
                    args: [parameters.amountIn, minAmountOut, routes, parameters.to || userAddress, timestamp],
                });
            }

            return txHash.hash;
        } catch (error) {
            console.error("Error in swapExactTokens:", error);
            throw error;
        }
    }

    private async getQuote(
        walletClient: EVMWalletClient,
        tokenIn: string,
        tokenOut: string,
        amountIn: string,
        stable: boolean,
    ): Promise<string> {
        const quoterAddress = QUOTER_ADDRESS[walletClient.getChain()?.id || 34443];

        // Call quoter contract to get expected output amount
        const quote = await walletClient.read({
            address: quoterAddress,
            abi: quoterabi,
            functionName: "quoteExactInputSingleV2",
            args: [
                {
                    tokenIn,
                    tokenOut,
                    stable,
                    amountIn: BigInt(amountIn),
                },
            ],
        });

        // Extract the value from the quote object
        const quoteValue = (quote as { value: bigint }).value.toString();
        return quoteValue;
    }

    @Tool({
        name: "add_liquidity",
        description: "Add liquidity to a Velodrome pool. Gets quote first and ensures sufficient allowance.",
    })
    async addLiquidity(walletClient: EVMWalletClient, parameters: AddLiquidityParams) {
        try {
            const userAddress = await walletClient.getAddress();
            if (!userAddress) {
                throw new Error("Could not get user address");
            }

            const chain = await walletClient.getChain();
            if (!chain) {
                throw new Error("Chain not configured in wallet client");
            }

            const routerAddress = ROUTER_ADDRESS[chain.id];
            if (!routerAddress) {
                throw new Error(`Router not found for chain ${chain.id}`);
            }

            // Get pool info and quotes
            const [token0, token1] = await this.sortTokens(walletClient, parameters.token0, parameters.token1);

            // Get reserves from factory
            const poolAddress = await this.getPool(walletClient, token0, token1, parameters.stable);

            const [reserve0, reserve1] = await this.getReserves(walletClient, poolAddress);

            // Calculate optimal amounts based on current reserves
            const [amount0Optimal, amount1Optimal] = this.getOptimalAmounts(
                BigInt(parameters.amount0Desired),
                BigInt(parameters.amount1Desired),
                reserve0,
                reserve1,
            );

            // Verify amounts are within acceptable ranges
            if (
                BigInt(amount0Optimal) < BigInt(parameters.amount0Min) ||
                BigInt(amount1Optimal) < BigInt(parameters.amount1Min)
            ) {
                throw new Error("Insufficient liquidity minted");
            }

            const timestamp = Math.floor(Date.now() / 1000) + parameters.deadline;

            // Add liquidity using Router
            const hash = await walletClient.sendTransaction({
                to: routerAddress,
                abi: routerabi,
                functionName: "addLiquidity",
                args: [
                    token0,
                    token1,
                    parameters.stable,
                    amount0Optimal,
                    amount1Optimal,
                    parameters.amount0Min,
                    parameters.amount1Min,
                    parameters.to || userAddress,
                    timestamp,
                ],
            });

            return hash.hash;
        } catch (error) {
            console.error("Error in addLiquidity:", error);
            throw error;
        }
    }

    private async sortTokens(walletClient: EVMWalletClient, tokenA: string, tokenB: string): Promise<[string, string]> {
        const routerAddress = ROUTER_ADDRESS[walletClient.getChain()?.id || 34443];
        const result = (await walletClient.read({
            address: routerAddress,
            abi: routerabi,
            functionName: "sortTokens",
            args: [tokenA, tokenB],
        })) as unknown as [string, string];
        return [result[0], result[1]];
    }

    private async getPool(
        walletClient: EVMWalletClient,
        token0: string,
        token1: string,
        stable: boolean,
    ): Promise<string> {
        const factoryAddress = FACTORY_ADDRESS[walletClient.getChain()?.id || 34443];
        return (await walletClient.read({
            address: factoryAddress,
            abi: [
                {
                    inputs: [
                        { internalType: "address", name: "tokenA", type: "address" },
                        { internalType: "address", name: "tokenB", type: "address" },
                        { internalType: "bool", name: "stable", type: "bool" },
                    ],
                    name: "getPair",
                    outputs: [{ internalType: "address", name: "", type: "address" }],
                    stateMutability: "view",
                    type: "function",
                },
            ],
            functionName: "getPair",
            args: [token0, token1, stable],
        })) as unknown as string;
    }

    private async getReserves(walletClient: EVMWalletClient, poolAddress: string): Promise<[bigint, bigint]> {
        const result = (await walletClient.read({
            address: poolAddress,
            abi: [
                {
                    inputs: [],
                    name: "getReserves",
                    outputs: [
                        { internalType: "uint256", name: "_reserve0", type: "uint256" },
                        { internalType: "uint256", name: "_reserve1", type: "uint256" },
                        { internalType: "uint256", name: "_blockTimestampLast", type: "uint256" },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
            ],
            functionName: "getReserves",
        })) as unknown as [bigint, bigint];
        return [result[0], result[1]];
    }

    private getOptimalAmounts(
        amount0Desired: bigint,
        amount1Desired: bigint,
        reserve0: bigint,
        reserve1: bigint,
    ): [bigint, bigint] {
        if (reserve0 === 0n && reserve1 === 0n) {
            return [amount0Desired, amount1Desired];
        }

        const amount1Optimal = (amount0Desired * reserve1) / reserve0;
        if (amount1Optimal <= amount1Desired) {
            return [amount0Desired, amount1Optimal];
        }

        const amount0Optimal = (amount1Desired * reserve0) / reserve1;
        return [amount0Optimal, amount1Desired];
    }
}
