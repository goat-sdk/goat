import { Tool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { erc20Abi } from "viem";
import { QUOTER_ABI } from "./abi/quoter.abi";
import { ROUTER_ABI } from "./abi/router.abi";
import { AddLiquidityParams, GetInfoVelodromeTokensParams, SwapExactTokensParams } from "./parameters";

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
            const userAddress = walletClient.getAddress();
            if (!userAddress) {
                throw new Error("Could not get user address");
            }

            const chain = walletClient.getChain();
            if (!chain) {
                throw new Error("Chain not configured in wallet client");
            }

            const routerAddress = ROUTER_ADDRESS[chain.id];
            if (!routerAddress) {
                throw new Error(`Router not found for chain ${chain.id}`);
            }

            parameters.tokenIn = this.getAddressForETH(parameters.tokenIn, chain.id);
            parameters.tokenOut = this.getAddressForETH(parameters.tokenOut, chain.id);
            parameters.stable = await this.isStablePairDynamic(parameters.tokenIn, parameters.tokenOut, chain.id);

            if (!this.isETHAddress(parameters.tokenIn, chain.id)) {
                const allowanceRaw = await walletClient.read({
                    address: parameters.tokenIn,
                    abi: erc20Abi,
                    functionName: "allowance",
                    args: [userAddress, routerAddress],
                });
                const allowance = BigInt(allowanceRaw.value as string);
                const amountInBigInt = BigInt(parameters.amountIn);
                if (allowance < amountInBigInt) {
                    await walletClient.sendTransaction({
                        to: parameters.tokenIn,
                        abi: erc20Abi,
                        functionName: "approve",
                        args: [routerAddress, amountInBigInt],
                    });
                }
            }

            // Get quote first
            const amountOutMin = await this.getQuote(
                walletClient,
                parameters.tokenIn,
                parameters.tokenOut,
                parameters.amountIn,
                parameters.stable,
            );

            // Apply slippage to quote (e.g. 0.5% slippage)
            const minAmountOut = (BigInt(amountOutMin) * BigInt(995)) / BigInt(1000);

            const timestamp = parameters.deadline;

            // Create route array
            const routes = [
                {
                    from: parameters.tokenIn,
                    to: parameters.tokenOut,
                    stable: parameters.stable,
                },
            ];

            let txHash: { hash: string };

            const swapType = this.isETHAddress(parameters.tokenIn, chain.id)
                ? "eth-to-token"
                : this.isETHAddress(parameters.tokenOut, chain.id)
                  ? "token-to-eth"
                  : "token-to-token";

            switch (swapType) {
                case "eth-to-token":
                    txHash = await walletClient.sendTransaction({
                        to: routerAddress,
                        abi: ROUTER_ABI,
                        functionName: "swapExactETHForTokens",
                        args: [minAmountOut, routes, parameters.to ?? userAddress, timestamp],
                        value: BigInt(parameters.amountIn),
                    });
                    break;
                case "token-to-eth":
                    txHash = await walletClient.sendTransaction({
                        to: routerAddress,
                        abi: ROUTER_ABI,
                        functionName: "swapExactTokensForETH",
                        args: [parameters.amountIn, minAmountOut, routes, parameters.to ?? userAddress, timestamp],
                    });
                    break;
                case "token-to-token":
                    txHash = await walletClient.sendTransaction({
                        to: routerAddress,
                        abi: ROUTER_ABI,
                        functionName: "swapExactTokensForTokens",
                        args: [parameters.amountIn, minAmountOut, routes, parameters.to ?? userAddress, timestamp],
                    });
                    break;
                default:
                    throw new Error("Swap type not recognized");
            }

            return {
                amountOutMin,
                tokenIn: parameters.tokenIn,
                tokenOut: parameters.tokenOut,
                chainId: chain.id,
                hash: txHash.hash,
            };
        } catch (error) {
            throw error instanceof Error ? error.message : JSON.stringify(error);
        }
    }

    private async isStablePairDynamic(tokenIn: string, tokenOut: string, chainId: number): Promise<boolean> {
        const stableTokenNames: [string, string][] = [["usdt", "usdc"]];
        const stablePairs: [string, string][] = [];

        for (const [tokenA, tokenB] of stableTokenNames) {
            const tokenAInfo = await this.getVelodromeTokenAddresses({ tokenName: tokenA });
            const tokenBInfo = await this.getVelodromeTokenAddresses({ tokenName: tokenB });

            const addressA = tokenAInfo.chains[chainId]?.contractAddress;
            const addressB = tokenBInfo.chains[chainId]?.contractAddress;

            if (addressA && addressB) {
                stablePairs.push([addressA.toLowerCase(), addressB.toLowerCase()]);
            }
        }

        const tokenInLower = tokenIn.toLowerCase();
        const tokenOutLower = tokenOut.toLowerCase();

        return stablePairs.some(
            ([a, b]) => (tokenInLower === a && tokenOutLower === b) || (tokenInLower === b && tokenOutLower === a),
        );
    }

    private getAddressForETH(token: string, chainId: number): string {
        if (token.toLowerCase() === "0x0") {
            return WETH_ADDRESS[chainId];
        }
        return token;
    }

    private isETHAddress(token: string, chainId: number): boolean {
        return token.toLowerCase() === WETH_ADDRESS[chainId].toLowerCase();
    }

    @Tool({
        name: "get_velodrome_token_address",
        description: "Get the address of the Velodrome contract.",
    })
    async getVelodromeTokenAddresses(parameters: GetInfoVelodromeTokensParams): Promise<Token> {
        const tokens: Record<string, Token> = {
            usdt: {
                decimals: 6,
                symbol: "USDT",
                name: "USDT",
                chains: {
                    34443: {
                        contractAddress: "0xf0f161fda2712db8b566946122a5af183995e2ed",
                    },
                },
            },
            usdc: {
                decimals: 6,
                symbol: "USDC",
                name: "USDC",
                chains: {
                    34443: {
                        contractAddress: "0xd988097fb8612cc24eeC14542bC03424c656005f",
                    },
                },
            },

            mode: {
                decimals: 18,
                symbol: "MODE",
                name: "Mode",
                chains: {
                    34443: {
                        contractAddress: "0xDfc7C877a950e49D2610114102175A06C2e3167a",
                    },
                },
            },

            weth: {
                decimals: 18,
                symbol: "WETH",
                name: "Wrapped Ether",
                chains: {
                    34443: {
                        contractAddress: "0x4200000000000000000000000000000000000006",
                    },
                },
            },
            eth: {
                decimals: 18,
                symbol: "ETH",
                name: "Ether",
                chains: {
                    34443: {
                        contractAddress: "0x4200000000000000000000000000000000000006",
                    },
                },
            },
        };

        const token = tokens[parameters.tokenName.toLowerCase()];
        if (!token) {
            throw new Error(`Token ${parameters.tokenName} not found`);
        }
        return token;
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
            abi: QUOTER_ABI,
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
                abi: ROUTER_ABI,
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
            abi: ROUTER_ABI,
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

type Token = {
    decimals: number;
    symbol: string;
    name: string;
    chains: Record<number, { contractAddress: `0x${string}` }>;
};
