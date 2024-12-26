import { Tool } from "@goat-sdk/core";
import type { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { BalancerApi, ChainId, Slippage, SwapKind, Token, Swap, AddLiquidity, AddLiquidityKind } from "@balancer/sdk";
import { SwapParameters, LiquidityParameters } from "./parameters";

export class BalancerService {
    private getBalancerApi(chainId: ChainId) {
        return new BalancerApi("https://api-v3.balancer.fi/", chainId);
    }

    @Tool({
        name: "swap_on_balancer",
        description: "Swap a token on Balancer using Smart Order Router"
    })
    async swapOnBalancer(walletClient: EVMWalletClient, parameters: SwapParameters) {
        const balancerApi = this.getBalancerApi(walletClient.getChain().id as ChainId);

        const tokenIn = new Token(
            walletClient.getChain().id as ChainId,
            parameters.tokenIn as `0x${string}`,
            parameters.tokenInDecimals
        );

        const tokenOut = new Token(
            walletClient.getChain().id as ChainId,
            parameters.tokenOut as `0x${string}`,
            parameters.tokenOutDecimals
        );

        const swapAmount = {
            amount: BigInt(parameters.amountIn),
        };

        const sorPaths = await balancerApi.sorSwapPaths.fetchSorSwapPaths({
            chainId: walletClient.getChain().id as ChainId,
            tokenIn: tokenIn.address,
            tokenOut: tokenOut.address,
            swapKind: SwapKind.GivenIn,
            swapAmount,
        });

        const swap = new Swap({
            chainId: walletClient.getChain().id as ChainId,
            paths: sorPaths,
            swapKind: SwapKind.GivenIn,
        });

        const provider = await walletClient.read;
        const updated = await swap.query(provider);

        const callData = swap.buildCall({
            slippage: Slippage.fromPercentage(`${Number(parameters.slippage)}`),
            deadline: parameters.deadline ? BigInt(parameters.deadline) : BigInt(Math.floor(Date.now() / 1000) + 3600),
            queryOutput: updated,
            wethIsEth: parameters.wethIsEth,
        });

        const tx = await walletClient.sendTransaction({
            to: callData.to as `0x${string}`,
            value: callData.value,
            functionName: 'swap',
            args: [callData.callData]
        });

        return {
            success: true,
            data: {
                amountOut: updated.expectedAmountOut.toString(),
                txHash: tx.hash,
            }
        };
    }

    @Tool({
        name: "add_liquidity_to_balancer",
        description: "Add liquidity to a Balancer pool"
    })
    async addLiquidity(walletClient: EVMWalletClient, parameters: LiquidityParameters) {
        const balancerApi = this.getBalancerApi(walletClient.getChain().id as ChainId);

        const poolState = await balancerApi.pools.fetchPoolState(parameters.pool as `0x${string}`);

        const amountsIn = parameters.amounts.map(amount => ({
            amount: BigInt(amount.amount),
            token: new Token(
                walletClient.getChain().id as ChainId,
                amount.token as `0x${string}`,
                amount.decimals
            )
        }));

        const provider = await walletClient.read;

        const addLiquidityInput = {
            amountsIn,
            chainId: walletClient.getChain().id as ChainId,
            provider,
            kind: AddLiquidityKind.Unbalanced,
        };

        const addLiquidity = new AddLiquidity();
        const queryOutput = await addLiquidity.query(addLiquidityInput, poolState);

        const call = addLiquidity.buildCall({
            ...queryOutput,
            slippage: Slippage.fromPercentage(`${Number(parameters.slippage)}`),
            chainId: walletClient.getChain().id as ChainId,
            wethIsEth: parameters.wethIsEth,
        });

        const tx = await walletClient.sendTransaction({
            to: call.to as `0x${string}`,
            value: call.value,
            functionName: 'addLiquidity',
            args: [call.callData]
        });

        return {
            success: true,
            data: {
                bptReceived: queryOutput.bptOut.toString(),
                txHash: tx.hash,
            }
        };
    }
}