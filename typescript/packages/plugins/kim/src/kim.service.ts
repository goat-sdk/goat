import { Tool } from "@goat-sdk/core";
import type { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { MintResponseSchema, increaseLiquidityResponseSchema, decreaseLiquidityResponseSchema, collectResponseSchema, exactInputSingleSchema, exactOutputSingleSchema, exactInputSchema, exactOutputSchema, mintSchema } from "./parameters";
import { KimContractAddresses } from "./types/KimCtorParams";
import { KIM_FACTORY_ABI } from './abi/factory';
import { POSITION_MANAGER_ABI } from './abi/positionManager';
import { SWAP_ROUTER_ABI } from './abi/swaprouter';
import { z } from "zod";
import { ERC20_ABI } from "./abi/erc20";
import { parseUnits } from "viem";
import { decodeEventLog, formatUnits } from "viem";
import { encodeAbiParameters } from "viem";
import { POOL_ABI } from './abi/pool';
import { globalStateResponseSchema } from "./parameters";

export class KimService {
    constructor(private readonly addresses: KimContractAddresses) {}

    @Tool({
        name: "kim_swap_exact_input_single_hop",
        description: "Swaps an exact amount of input tokens for a single hop",
    })
    async swapExactInputSingleHop(
        walletClient: EVMWalletClient,
        parameters: z.infer<typeof exactInputSingleSchema>
    ): Promise<string> {
        try {
            const tokenIn = await walletClient.resolveAddress(parameters.tokenIn);
            const tokenOut = await walletClient.resolveAddress(parameters.tokenOut);
            const recipient = await walletClient.resolveAddress(parameters.recipient);

            const tokenInDecimals = Number(await walletClient.read({
                address: parameters.tokenIn as `0x${string}`,
                abi: ERC20_ABI,
                functionName: "decimals",
            }));

            const tokenOutDecimals = Number(await walletClient.read({
                address: parameters.tokenOut as `0x${string}`,
                abi: ERC20_ABI,
                functionName: "decimals",
            }));

            const amountIn = parseUnits(parameters.amountIn, tokenInDecimals);
            const amountOutMinimum = parseUnits(parameters.amountOutMinimum, tokenOutDecimals);
            const limitSqrtPrice = parseUnits(parameters.limitSqrtPrice, 96);

            const hash = await walletClient.sendTransaction({
                to: this.addresses.swapRouter,
                abi: SWAP_ROUTER_ABI,
                functionName: "exactInputSingle",
                args: [
                    tokenIn,
                    tokenOut,
                    recipient,
                    parameters.deadline,
                    amountIn,
                    amountOutMinimum,
                    limitSqrtPrice,
                ],
            });

            return hash.hash;

            // TODO get the amountOut
        } catch (error) {
            throw Error(`Failed to swap: ${error}`);
        }
    }

    @Tool({
        name: "kim_swap_exact_output_single_hop",
        description: "Swaps an exact amount of output tokens for a single hop",
    })
    async swapExactOutputSingleHop(
        walletClient: EVMWalletClient,
        parameters: z.infer<typeof exactOutputSingleSchema>
    ): Promise<string> {
        try {
            const tokenIn = await walletClient.resolveAddress(parameters.tokenIn);
            const tokenOut = await walletClient.resolveAddress(parameters.tokenOut);
            const recipient = await walletClient.resolveAddress(parameters.recipient);

            const tokenInDecimals = Number(await walletClient.read({
                address: parameters.tokenIn as `0x${string}`,
                abi: ERC20_ABI,
                functionName: "decimals",
            }));

            const tokenOutDecimals = Number(await walletClient.read({
                address: parameters.tokenOut as `0x${string}`,
                abi: ERC20_ABI,
                functionName: "decimals",
            }));

            const amountOut = parseUnits(parameters.amountOut, tokenOutDecimals);
            const amountInMaximum = parseUnits(parameters.amountInMaximum, tokenInDecimals);
            const limitSqrtPrice = parseUnits(parameters.limitSqrtPrice, 96);

            const hash = await walletClient.sendTransaction({
                to: this.addresses.swapRouter,
                abi: SWAP_ROUTER_ABI,
                functionName: "exactOutputSingle",
                args: [
                    tokenIn,
                    tokenOut,
                    recipient,
                    parameters.deadline,
                    amountOut,
                    amountInMaximum,
                    limitSqrtPrice,
                ],
            });

            return hash.hash;
        } catch (error) {
            throw Error(`Failed to swap: ${error}`);
        }
    }

    @Tool({
        name: "kim_swap_exact_input_multi_hop",
        description: "Swaps an exact amount of input tokens in multiple hops",
    })
    async swapExactInputMultiHop(
        walletClient: EVMWalletClient,
        parameters: z.infer<typeof exactInputSchema>
    ): Promise<string> {
        try {
            const recipient = await walletClient.resolveAddress(parameters.recipient);

            // Get first and last token decimals
            const tokenInDecimals = Number(await walletClient.read({
                address: parameters.path.tokenIn as `0x${string}`,
                abi: ERC20_ABI,
                functionName: "decimals",
            }));

            const tokenOutDecimals = Number(await walletClient.read({
                address: parameters.path.tokenOut as `0x${string}`,
                abi: ERC20_ABI,
                functionName: "decimals",
            }));

            // Encode the path
            const encodedPath = encodeAbiParameters(
                [{ type: 'address[]' }, { type: 'uint24[]' }],
                [[
                    parameters.path.tokenIn as `0x${string}`,
                    ...parameters.path.intermediateTokens.map(t => t as `0x${string}`),
                    parameters.path.tokenOut as `0x${string}`
                ], parameters.path.fees]
            );

            const hash = await walletClient.sendTransaction({
                to: this.addresses.swapRouter,
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
        description: "Swaps tokens to receive an exact amount of output tokens in multiple hops",
    })
    async swapExactOutputMultiHop(
        walletClient: EVMWalletClient,
        parameters: z.infer<typeof exactOutputSchema>
    ): Promise<string> {
        try {
            const recipient = await walletClient.resolveAddress(parameters.recipient);

            // Get first and last token decimals
            const tokenInDecimals = Number(await walletClient.read({
                address: parameters.path.tokenIn as `0x${string}`,
                abi: ERC20_ABI,
                functionName: "decimals",
            }));

            const tokenOutDecimals = Number(await walletClient.read({
                address: parameters.path.tokenOut as `0x${string}`,
                abi: ERC20_ABI,
                functionName: "decimals",
            }));

            // Encode the path
            const encodedPath = encodeAbiParameters(
                [{ type: 'address[]' }, { type: 'uint24[]' }],
                [[
                    parameters.path.tokenIn as `0x${string}`,
                    ...parameters.path.intermediateTokens.map((t: string) => t as `0x${string}`),
                    parameters.path.tokenOut as `0x${string}`
                ], parameters.path.fees]
            );

            const hash = await walletClient.sendTransaction({
                to: this.addresses.swapRouter,
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
        description: "Mints a new liquidity position",
    })
    async mintPosition(
        walletClient: EVMWalletClient,
        parameters: z.infer<typeof mintSchema>
    ): Promise<string> {
        try {
            const tickSpacing = 60; // This should come from the pool fee tier
            const recipient = await walletClient.resolveAddress(parameters.recipient);
            const token0 = await walletClient.resolveAddress(parameters.token0);
            const token1 = await walletClient.resolveAddress(parameters.token1);

            // Get current tick from globalState
            const poolAddress = await walletClient.read({
                address: this.addresses.factory as `0x${string}`,
                abi: KIM_FACTORY_ABI,
                functionName: "getPool",
                args: [token0, token1],
            });

            const globalState = await walletClient.read({
                address: poolAddress as unknown as `0x${string}`,
                abi: POOL_ABI,
                functionName: "globalState",
            }) as any as z.infer<typeof globalStateResponseSchema>;

            const currentTick = globalState.tick;

            // Calculate ticks around current price
            const tickLower = Math.floor(currentTick / tickSpacing)
                * tickSpacing - tickSpacing * 2;
            const tickUpper = Math.floor(currentTick / tickSpacing)
                * tickSpacing + tickSpacing * 2;

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
                to: this.addresses.positionManager,
                abi: POSITION_MANAGER_ABI,
                functionName: "mint",
                args: [{
                    token0,
                    token1,
                    tickLower,
                    tickUpper,
                    amount0Desired,
                    amount1Desired,
                    amount0Min: 0, // Consider adding slippage protection
                    amount1Min: 0, // Consider adding slippage protection
                    recipient,
                    deadline: parameters.deadline
                }]
            });

            return hash.hash;
        } catch (error) {
            throw new Error(`Failed to mint position: ${error}`);
        }
    }

}
