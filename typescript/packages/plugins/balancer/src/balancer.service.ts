import { Tool } from "@goat-sdk/core";
import type { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { BalancerApi, ChainId, Slippage, SwapKind, Token, Swap, AddLiquidity, AddLiquidityKind, TokenAmount } from "@balancer/sdk";
import { SwapParameters, LiquidityParameters } from "./parameters";

export class BalancerService {
    @Tool({
        description: "Performs a token swap on Balancer using their Smart Order Router",
    })
    async swap(walletClient: EVMWalletClient, parameters: SwapParameters) {
        const balancerApi = new BalancerApi(
            "https://api-v3.balancer.fi/",
            walletClient.getChain().id as ChainId
        );

        const tokenInAddress = await walletClient.resolveAddress(parameters.tokenIn);
        const tokenOutAddress = await walletClient.resolveAddress(parameters.tokenOut);

        const tokenIn = new Token(
            walletClient.getChain().id as ChainId,
            tokenInAddress,
            18
        );

        const tokenOut = new Token(
            walletClient.getChain().id as ChainId,
            tokenOutAddress,
            18
        );

        const swapAmount : TokenAmount = {
            amount: BigInt(parameters.amountIn),
        };

        const sorPaths = await balancerApi.sorSwapPaths.fetchSorSwapPaths({
            chainId: walletClient.getChain().id as ChainId,
            tokenIn: tokenInAddress,
            tokenOut: tokenOutAddress,
            swapKind: SwapKind.GivenIn,
            swapAmount,
        });

        const swap = new Swap({
            chainId: walletClient.getChain().id as ChainId,
            paths: sorPaths,
            swapKind: SwapKind.GivenIn,
        });

        const provider = await walletClient.read({
            address: tokenInAddress,
            abi: [],
            functionName: ""
        });

        const updated = await swap.query(provider);

        const callData = swap.buildCall({
            slippage: Slippage.fromPercentage(`${Number(parameters.slippage)}`),
            deadline: parameters.deadline ? BigInt(parameters.deadline) : BigInt(Math.floor(Date.now() / 1000) + 3600),
            queryOutput: updated,
            wethIsEth: parameters.wethIsEth,
        });

        const tx = await walletClient.sendTransaction({
            to: callData.to as string,
            value: callData.value
        });

        return tx.hash;
    }

    @Tool({
        description: "Provides liquidity to a Balancer pool",
    })
    async addLiquidity(walletClient: EVMWalletClient, parameters: LiquidityParameters) {
        const balancerApi = new BalancerApi(
            "https://api-v3.balancer.fi/",
            walletClient.getChain().id as ChainId
        );

        const poolAddress = await walletClient.resolveAddress(parameters.pool);
        const poolState = await balancerApi.pools.fetchPoolState(poolAddress);

        const amountsIn = await Promise.all(parameters.amounts.map(async amount => ({
            amount: BigInt(amount.amount),
            token: new Token(
                walletClient.getChain().id as ChainId,
                await walletClient.resolveAddress(amount.token),
                amount.decimals
            )
        })));

        const provider = await walletClient.read({
            address: poolAddress,
            abi: [],
            functionName: ""
        });

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
            to: call.to as string,
            value: call.value
        });

        return tx.hash;
    }
} 