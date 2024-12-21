import { WalletClient } from "@goat-sdk/core";
import { LiquidityParams } from "../types";
import {
  BalancerApi,
  ChainId,
  Slippage,
  AddLiquidity,
  AddLiquidityKind
} from "@balancer/sdk";

export async function provideLiquidity(
  wallet: WalletClient,
  params: LiquidityParams
) {
  const balancerApi = new BalancerApi(
    "https://api-v3.balancer.fi/",
    wallet.chain.id as ChainId
  );

  const poolState = await balancerApi.pools.fetchPoolState(params.pool);

  const amountsIn = params.amounts.map(amount => ({
    address: amount.token,
    decimals: amount.decimals,
    rawAmount: BigInt(amount.amount),
  }));

  const addLiquidityInput = {
    amountsIn,
    chainId: wallet.chain.id as ChainId,
    rpcUrl: wallet.provider,
    kind: AddLiquidityKind.Unbalanced,
  };

  const addLiquidity = new AddLiquidity();
  const queryOutput = await addLiquidity.query(addLiquidityInput, poolState);

  const call = addLiquidity.buildCall({
    ...queryOutput,
    slippage: Slippage.fromPercentage(params.slippage),
    chainId: wallet.chain.id as ChainId,
    wethIsEth: params.wethIsEth,
  });

  const tx = await wallet.sendTransaction({
    to: call.to,
    data: call.callData,
    value: call.value,
  });

  return {
    success: true,
    data: {
      bptReceived: queryOutput.bptOut.amount.toString(),
      txHash: tx.hash,
    }
  };
} 