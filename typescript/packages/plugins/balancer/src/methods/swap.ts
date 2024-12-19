import { WalletClient } from "@goat-sdk/core";
import { SwapParams } from "../types";
import { 
  BalancerApi, 
  ChainId, 
  Slippage, 
  SwapKind, 
  Token,
  Swap
} from "@balancer/sdk";

export async function performSwap(
  wallet: WalletClient,
  params: SwapParams
) {
  const balancerApi = new BalancerApi(
    "https://api-v3.balancer.fi/",
    wallet.chain.id as ChainId
  );

  const tokenIn = new Token(
    wallet.chain.id as ChainId,
    params.tokenIn,
    18
  );

  const tokenOut = new Token(
    wallet.chain.id as ChainId,
    params.tokenOut,
    18
  );

  const swapAmount = BigInt(params.amountIn);

  const sorPaths = await balancerApi.sorSwapPaths.fetchSorSwapPaths({
    chainId: wallet.chain.id as ChainId,
    tokenIn: params.tokenIn,
    tokenOut: params.tokenOut,
    swapKind: SwapKind.GivenIn,
    swapAmount,
  });

  const swap = new Swap({
    chainId: wallet.chain.id as ChainId,
    paths: sorPaths,
    swapKind: SwapKind.GivenIn,
  });

  const updated = await swap.query(wallet.provider);

  const callData = swap.buildCall({
    slippage: Slippage.fromPercentage(params.slippage),
    deadline: params.deadline ? BigInt(params.deadline) : BigInt(Math.floor(Date.now() / 1000) + 3600),
    queryOutput: updated,
    wethIsEth: params.wethIsEth,
  });

  const tx = await wallet.sendTransaction({
    to: callData.to,
    data: callData.callData,
    value: callData.value,
  });

  return {
    success: true,
    data: {
      amountOut: updated.expectedAmountOut.toString(),
      txHash: tx.hash,
    }
  };
} 