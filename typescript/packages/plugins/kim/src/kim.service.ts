import { Tool } from "@goat-sdk/core";
import type { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { MintResponseSchema, increaseLiquidityResponseSchema, decreaseLiquidityResponseSchema, collectResponseSchema, exactInputSingleSchema, exactOutputSingleSchema } from "./parameters";
import { KimContractAddresses } from "./types/KimCtorParams";
import { KIM_FACTORY_ABI } from './abi/factory';
import { POSITION_MANAGER_ABI } from './abi/positionManager';
import { SWAP_ROUTER_ABI } from './abi/swaprouter';
import { z } from "zod";
import { ERC20_ABI } from "./abi/erc20";
import { parseUnits } from "viem";

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
            const walletAddress = await walletClient.resolveAddress(parameters.wallet);
            const tokenIn = await walletClient.resolveAddress(parameters.tokenIn);
            const tokenOut = await walletClient.resolveAddress(parameters.tokenOut);
            const recipient = await walletClient.resolveAddress(parameters.recipient);

            const tokenInDecimals = await walletClient.read({
                address: parameters.tokenIn as `0x${string}`,
                abi: ERC20_ABI,
                functionName: "decimals",
            });

            const tokenOutDecimals = await walletClient.read({
                address: parameters.tokenOut as `0x${string}`,
                abi: ERC20_ABI,
                functionName: "decimals",
            });

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
                    deadline,
                    amountIn,
                    amountOutMinimum,
                    limitSqrtPrice,
                ],
            });

            return hash.hash;
        } catch (error) {
            throw Error(`Failed to swap: ${error}`);
        }
    }
}
