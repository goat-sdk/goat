import { Tool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { parseUnits } from "viem";
import { encodeAbiParameters } from "viem";
import { ERC20_ABI } from "./abi/erc20";
import { KIM_FACTORY_ABI } from "./abi/factory";
import { POOL_ABI } from "./abi/pool";
import { POSITION_MANAGER_ABI } from "./abi/positionManager";
import { SWAP_ROUTER_ABI } from "./abi/swaprouter";
import {
    BurnParams,
    CollectParams,
    DecreaseLiquidityParams,
    ExactInputParams,
    ExactInputSingleParams,
    ExactOutputParams,
    ExactOutputSingleParams,
    GetSwapRouterAddressParams,
    GlobalStateResponseParams,
    IncreaseLiquidityParams,
    MintParams,
} from "./parameters";

const SWAP_ROUTER_ADDRESS = "0xAc48FcF1049668B285f3dC72483DF5Ae2162f7e8";
const POSITION_MANAGER_ADDRESS = "0x2e8614625226D26180aDf6530C3b1677d3D7cf10";
const FACTORY_ADDRESS = "0xB5F00c2C5f8821155D8ed27E31932CFD9DB3C5D5";

export class KimService {
    @Tool({
        name: "kim_get_swap_router_address",
        description: "Get the address of the swap router",
    })
    async getSwapRouterAddress(parameters: GetSwapRouterAddressParams) {
        return SWAP_ROUTER_ADDRESS;
    }

    @Tool({
        description:
            "Swap an exact amount of input tokens for a single hop. Make sure tokens are approved for the swap router.",
    })
    async swapExactInputSingleHop(walletClient: EVMWalletClient, parameters: ExactInputSingleParams) {
        try {
            const recipient = await walletClient.resolveAddress(parameters.recipient);

            const amountIn = parameters.amountIn;
            const amountOutMinimum = parameters.amountOutMinimum;
            const limitSqrtPrice = parameters.limitSqrtPrice;
            const timestamp = Math.floor(Date.now() / 1000) + parameters.deadline;

            const hash = await walletClient.sendTransaction({
                to: SWAP_ROUTER_ADDRESS,
                abi: SWAP_ROUTER_ABI,
                functionName: "exactInputSingle",
                args: [
                    {
                        tokenIn: parameters.tokenIn,
                        tokenOut: parameters.tokenOut,
                        recipient: recipient,
                        deadline: timestamp,
                        amountIn: amountIn,
                        amountOutMinimum: amountOutMinimum,
                        limitSqrtPrice: limitSqrtPrice,
                    },
                ],
            });

            return hash.hash;
        } catch (error) {
            throw Error(`Failed to swap: ${error}`);
        }
    }

    @Tool({
        name: "kim_swap_exact_output_single_hop",
        description: "Swap an exact amount of output tokens for a single hop",
    })
    async swapExactOutputSingleHop(
        walletClient: EVMWalletClient,
        parameters: ExactOutputSingleParams,
    ): Promise<string> {
        try {
            const tokenIn = await walletClient.resolveAddress(parameters.tokenIn);
            const tokenOut = await walletClient.resolveAddress(parameters.tokenOut);
            const recipient = await walletClient.resolveAddress(parameters.recipient);

            const tokenInDecimals = Number(
                await walletClient.read({
                    address: parameters.tokenIn as `0x${string}`,
                    abi: ERC20_ABI,
                    functionName: "decimals",
                }),
            );

            const tokenOutDecimals = Number(
                await walletClient.read({
                    address: parameters.tokenOut as `0x${string}`,
                    abi: ERC20_ABI,
                    functionName: "decimals",
                }),
            );

            const amountOut = parseUnits(parameters.amountOut, tokenOutDecimals);
            const amountInMaximum = parseUnits(parameters.amountInMaximum, tokenInDecimals);
            const limitSqrtPrice = parseUnits(parameters.limitSqrtPrice, 96);

            const hash = await walletClient.sendTransaction({
                to: SWAP_ROUTER_ADDRESS,
                abi: SWAP_ROUTER_ABI,
                functionName: "exactOutputSingle",
                args: [tokenIn, tokenOut, recipient, parameters.deadline, amountOut, amountInMaximum, limitSqrtPrice],
            });

            return hash.hash;
        } catch (error) {
            throw Error(`Failed to swap: ${error}`);
        }
    }

    @Tool({
        name: "kim_swap_exact_input_multi_hop",
        description: "Swap an exact amount of input tokens in multiple hops",
    })
    async swapExactInputMultiHop(walletClient: EVMWalletClient, parameters: ExactInputParams): Promise<string> {
        try {
            const recipient = await walletClient.resolveAddress(parameters.recipient);

            // Get first and last token decimals
            const tokenInDecimals = Number(
                await walletClient.read({
                    address: parameters.path.tokenIn as `0x${string}`,
                    abi: ERC20_ABI,
                    functionName: "decimals",
                }),
            );

            const tokenOutDecimals = Number(
                await walletClient.read({
                    address: parameters.path.tokenOut as `0x${string}`,
                    abi: ERC20_ABI,
                    functionName: "decimals",
                }),
            );

            // Encode the path
            const encodedPath = encodeAbiParameters(
                [{ type: "address[]" }, { type: "uint24[]" }],
                [
                    [
                        parameters.path.tokenIn as `0x${string}`,
                        ...parameters.path.intermediateTokens.map((t: string) => t as `0x${string}`),
                        parameters.path.tokenOut as `0x${string}`,
                    ],
                    parameters.path.fees,
                ],
            );

            const hash = await walletClient.sendTransaction({
                to: SWAP_ROUTER_ADDRESS,
                abi: SWAP_ROUTER_ABI,
                functionName: "exactInput",
                args: [
                    encodedPath,
                    recipient,
                    parameters.deadline,
                    parseUnits(parameters.amountIn, tokenInDecimals),
                    parseUnits(parameters.amountOutMinimum, tokenOutDecimals),
                ],
            });

            return hash.hash;
        } catch (error) {
            throw new Error(`Failed to swap: ${error}`);
        }
    }

    @Tool({
        name: "kim_swap_exact_output_multi_hop",
        description: "Swap tokens to receive an exact amount of output tokens in multiple hops",
    })
    async swapExactOutputMultiHop(walletClient: EVMWalletClient, parameters: ExactOutputParams): Promise<string> {
        try {
            const recipient = await walletClient.resolveAddress(parameters.recipient);

            // Get first and last token decimals
            const tokenInDecimals = Number(
                await walletClient.read({
                    address: parameters.path.tokenIn as `0x${string}`,
                    abi: ERC20_ABI,
                    functionName: "decimals",
                }),
            );

            const tokenOutDecimals = Number(
                await walletClient.read({
                    address: parameters.path.tokenOut as `0x${string}`,
                    abi: ERC20_ABI,
                    functionName: "decimals",
                }),
            );

            // Encode the path
            const encodedPath = encodeAbiParameters(
                [{ type: "address[]" }, { type: "uint24[]" }],
                [
                    [
                        parameters.path.tokenIn as `0x${string}`,
                        ...parameters.path.intermediateTokens.map((t: string) => t as `0x${string}`),
                        parameters.path.tokenOut as `0x${string}`,
                    ],
                    parameters.path.fees,
                ],
            );

            const hash = await walletClient.sendTransaction({
                to: SWAP_ROUTER_ADDRESS,
                abi: SWAP_ROUTER_ABI,
                functionName: "exactOutput",
                args: [
                    encodedPath,
                    recipient,
                    parameters.deadline,
                    parseUnits(parameters.amountOut, tokenOutDecimals),
                    parseUnits(parameters.amountInMaximum, tokenInDecimals),
                ],
            });

            return hash.hash;
        } catch (error) {
            throw new Error(`Failed to swap: ${error}`);
        }
    }

    @Tool({
        name: "kim_mint_position",
        description: "Mint a new liquidity position",
    })
    async mintPosition(walletClient: EVMWalletClient, parameters: MintParams): Promise<string> {
        try {
            const tickSpacing = 60; // This should come from the pool fee tier
            const recipient = await walletClient.resolveAddress(parameters.recipient);
            const token0 = await walletClient.resolveAddress(parameters.token0);
            const token1 = await walletClient.resolveAddress(parameters.token1);

            // Get current tick from globalState
            const poolAddress = await walletClient.read({
                address: FACTORY_ADDRESS as `0x${string}`,
                abi: KIM_FACTORY_ABI,
                functionName: "getPool",
                args: [token0, token1],
            });

            const { value } = await walletClient.read({
                address: poolAddress as unknown as `0x${string}`,
                abi: POOL_ABI,
                functionName: "globalState",
            });

            const globalState = value as GlobalStateResponseParams;
            const currentTick = globalState.tick;

            // Calculate ticks around current price
            const tickLower = parameters.tickLower
                ? parameters.tickLower
                : Math.floor(currentTick / tickSpacing) * tickSpacing - tickSpacing * 2;
            const tickUpper = parameters.tickUpper
                ? parameters.tickUpper
                : Math.floor(currentTick / tickSpacing) * tickSpacing + tickSpacing * 2;

            const [token0Decimals, token1Decimals] = await Promise.all([
                walletClient.read({
                    address: parameters.token0 as `0x${string}`,
                    abi: ERC20_ABI,
                    functionName: "decimals",
                }),
                walletClient.read({
                    address: parameters.token1 as `0x${string}`,
                    abi: ERC20_ABI,
                    functionName: "decimals",
                }),
            ]);

            const amount0Desired = parseUnits(parameters.amount0Desired, Number(token0Decimals));
            const amount1Desired = parseUnits(parameters.amount1Desired, Number(token1Decimals));

            const hash = await walletClient.sendTransaction({
                to: POSITION_MANAGER_ADDRESS,
                abi: POSITION_MANAGER_ABI,
                functionName: "mint",
                args: [
                    {
                        token0,
                        token1,
                        tickLower,
                        tickUpper,
                        amount0Desired,
                        amount1Desired,
                        amount0Min: 0, // Consider adding slippage protection
                        amount1Min: 0, // Consider adding slippage protection
                        recipient,
                        deadline: parameters.deadline,
                    },
                ],
            });

            return hash.hash;
            // TODO get the liquidity and tokenId
        } catch (error) {
            throw new Error(`Failed to mint position: ${error}`);
        }
    }

    @Tool({
        name: "kim_increase_liquidity",
        description: "Increase liquidity in an existing position",
    })
    async increaseLiquidity(walletClient: EVMWalletClient, parameters: IncreaseLiquidityParams): Promise<string> {
        try {
            const [token0Decimals, token1Decimals] = await Promise.all([
                Number(
                    await walletClient.read({
                        address: parameters.token0 as `0x${string}`,
                        abi: ERC20_ABI,
                        functionName: "decimals",
                    }),
                ),
                Number(
                    await walletClient.read({
                        address: parameters.token1 as `0x${string}`,
                        abi: ERC20_ABI,
                        functionName: "decimals",
                    }),
                ),
            ]);

            const hash = await walletClient.sendTransaction({
                to: POSITION_MANAGER_ADDRESS,
                abi: POSITION_MANAGER_ABI,
                functionName: "increaseLiquidity",
                args: [
                    {
                        tokenId: parameters.tokenId,
                        amount0Desired: parseUnits(parameters.amount0Desired, token0Decimals),
                        amount1Desired: parseUnits(parameters.amount1Desired, token1Decimals),
                        amount0Min: parseUnits(parameters.amount0Min, token0Decimals),
                        amount1Min: parseUnits(parameters.amount1Min, token1Decimals),
                        deadline: parameters.deadline,
                    },
                ],
            });

            return hash.hash;
        } catch (error) {
            throw new Error(`Failed to increase liquidity: ${error}`);
        }
    }

    @Tool({
        name: "kim_decrease_liquidity",
        description: "Decrease liquidity in an existing position",
    })
    async decreaseLiquidity(walletClient: EVMWalletClient, parameters: DecreaseLiquidityParams): Promise<string> {
        try {
            const [token0Decimals, token1Decimals] = await Promise.all([
                Number(
                    await walletClient.read({
                        address: parameters.token0 as `0x${string}`,
                        abi: ERC20_ABI,
                        functionName: "decimals",
                    }),
                ),
                Number(
                    await walletClient.read({
                        address: parameters.token1 as `0x${string}`,
                        abi: ERC20_ABI,
                        functionName: "decimals",
                    }),
                ),
            ]);

            const hash = await walletClient.sendTransaction({
                to: POSITION_MANAGER_ADDRESS,
                abi: POSITION_MANAGER_ABI,
                functionName: "decreaseLiquidity",
                args: [
                    {
                        tokenId: parameters.tokenId,
                        liquidity: parseUnits(parameters.liquidity, 18), // Liquidity has 18 decimals
                        amount0Min: parseUnits(parameters.amount0Min, token0Decimals),
                        amount1Min: parseUnits(parameters.amount1Min, token1Decimals),
                        deadline: parameters.deadline,
                    },
                ],
            });

            return hash.hash;
        } catch (error) {
            throw new Error(`Failed to decrease liquidity: ${error}`);
        }
    }

    @Tool({
        name: "kim_collect",
        description: "Collect tokens from a liquidity position",
    })
    async collect(walletClient: EVMWalletClient, parameters: CollectParams): Promise<string> {
        try {
            const recipient = await walletClient.resolveAddress(parameters.recipient);

            const [token0Decimals, token1Decimals] = await Promise.all([
                Number(
                    await walletClient.read({
                        address: parameters.token0 as `0x${string}`,
                        abi: ERC20_ABI,
                        functionName: "decimals",
                    }),
                ),
                Number(
                    await walletClient.read({
                        address: parameters.token1 as `0x${string}`,
                        abi: ERC20_ABI,
                        functionName: "decimals",
                    }),
                ),
            ]);

            const hash = await walletClient.sendTransaction({
                to: POSITION_MANAGER_ADDRESS,
                abi: POSITION_MANAGER_ABI,
                functionName: "collect",
                args: [
                    {
                        tokenId: parameters.tokenId,
                        recipient,
                        amount0Max: parseUnits(parameters.amount0Max, token0Decimals),
                        amount1Max: parseUnits(parameters.amount1Max, token1Decimals),
                    },
                ],
            });

            return hash.hash;
        } catch (error) {
            throw new Error(`Failed to collect: ${error}`);
        }
    }

    @Tool({
        name: "kim_burn",
        description: "Burn a liquidity position NFT after all tokens have been collected",
    })
    async burn(walletClient: EVMWalletClient, parameters: BurnParams): Promise<string> {
        try {
            const hash = await walletClient.sendTransaction({
                to: POSITION_MANAGER_ADDRESS,
                abi: POSITION_MANAGER_ABI,
                functionName: "burn",
                args: [parameters.tokenId],
            });

            return hash.hash;
        } catch (error) {
            throw new Error(`Failed to burn position: ${error}`);
        }
    }
}
