import { Tool } from "@goat-sdk/core";
import { SolanaWalletClient } from "@goat-sdk/wallet-solana";
import { Connection, PublicKey, VersionedTransaction } from "@solana/web3.js";
import type { DistributionStrategy } from "orbit-dlmm";
import {
  GetPriceParameters,
  GetPoolInfoParameters,
  GetQuoteParameters,
  SwapParameters,
  AddLiquidityParameters,
  RemoveLiquidityParameters,
} from "./parameters";

const ORBIT_API_BASE = "https://orbit-dex.api.cipherlabsx.com/api/v1";
const ORBIT_PROGRAM_ID = "Fn3fA3fjsmpULNL7E9U79jKTe1KHxPtQeWdURCbJXCnM";

async function apiFetch<T>(path: string): Promise<T> {
  const url = `${ORBIT_API_BASE}${path}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Orbit API ${res.status} at ${path}: ${body}`);
  }
  return res.json() as Promise<T>;
}

function toBaseUnits(amount: number, decimals: number): bigint {
  return BigInt(Math.round(amount * 10 ** decimals));
}

export class OrbitService {
  private connection: Connection;

  constructor(rpcUrl: string) {
    this.connection = new Connection(rpcUrl, "confirmed");
  }

  @Tool({
    description:
      "Get the current USD price for an Orbit Finance DLMM pool. " +
      "Returns priceUsd (token X price in USD), activeBinId, and fee tier.",
  })
  async getOrbitPrice(parameters: GetPriceParameters) {
    const pool = await apiFetch<{
      priceUsd: number;
      activeBinId: number;
      binStep: number;
      feeRate: number;
      tokenX: { mint: string; symbol: string; decimals: number };
      tokenY: { mint: string; symbol: string; decimals: number };
    }>(`/pools/${parameters.poolId}`);

    return {
      poolId: parameters.poolId,
      priceUsd: pool.priceUsd,
      activeBinId: pool.activeBinId,
      binStep: pool.binStep,
      feeRateBps: pool.feeRate,
      tokenX: pool.tokenX,
      tokenY: pool.tokenY,
    };
  }

  @Tool({
    description:
      "Get full metadata for an Orbit Finance DLMM pool: TVL, 24h volume, reserves, " +
      "fee tier, bin step, and both token details.",
  })
  async getOrbitPoolInfo(parameters: GetPoolInfoParameters) {
    const pool = await apiFetch<Record<string, unknown>>(
      `/pools/${parameters.poolId}`
    );
    return pool;
  }

  @Tool({
    description:
      "Get a swap quote for trading two tokens through Orbit Finance DLMM. " +
      "Returns expectedOutput, priceImpactPct, and minOutput at 1% slippage. " +
      "Use the poolId returned here as input to orbit_swap.",
  })
  async getOrbitQuote(parameters: GetQuoteParameters) {
    const pools = await apiFetch<
      Array<{
        id: string;
        tokenX: { mint: string; symbol: string; decimals: number };
        tokenY: { mint: string; symbol: string; decimals: number };
        priceUsd: number;
        activeBinId: number;
        binStep: number;
        feeRate: number;
        reserveX: string;
        reserveY: string;
      }>
    >("/pools");

    const matchedPool = pools.find(
      (p) =>
        (p.tokenX.mint === parameters.inputMint &&
          p.tokenY.mint === parameters.outputMint) ||
        (p.tokenY.mint === parameters.inputMint &&
          p.tokenX.mint === parameters.outputMint)
    );

    if (!matchedPool) {
      throw new Error(
        `No Orbit Finance pool found for pair ${parameters.inputMint} / ${parameters.outputMint}. ` +
          `Use get_orbit_pool_info to verify pool IDs.`
      );
    }

    const isXtoY = matchedPool.tokenX.mint === parameters.inputMint;
    const inToken = isXtoY ? matchedPool.tokenX : matchedPool.tokenY;
    const outToken = isXtoY ? matchedPool.tokenY : matchedPool.tokenX;

    const inReserve = isXtoY
      ? Number(matchedPool.reserveX)
      : Number(matchedPool.reserveY);
    const outReserve = isXtoY
      ? Number(matchedPool.reserveY)
      : Number(matchedPool.reserveX);

    const inAmount = parameters.amount * 10 ** inToken.decimals;
    const expectedOutRaw =
      outReserve - (inReserve * outReserve) / (inReserve + inAmount);
    const expectedOut = expectedOutRaw / 10 ** outToken.decimals;
    const feeAmount = parameters.amount * (matchedPool.feeRate / 10000);
    const priceImpactPct = (inAmount / (inReserve + inAmount)) * 100;

    return {
      poolId: matchedPool.id,
      inputMint: parameters.inputMint,
      outputMint: parameters.outputMint,
      inputAmount: parameters.amount,
      inputSymbol: inToken.symbol,
      expectedOutput: Number(expectedOut.toFixed(outToken.decimals)),
      outputSymbol: outToken.symbol,
      feeAmount: Number(feeAmount.toFixed(inToken.decimals)),
      priceImpactPct: Number(priceImpactPct.toFixed(4)),
      minOutputAt1PctSlippage: Number((expectedOut * 0.99).toFixed(outToken.decimals)),
      note: "Spot price estimate only. Exact output depends on bin state at execution time.",
    };
  }

  @Tool({
    description:
      "Execute a token swap on Orbit Finance DLMM. " +
      "Call get_orbit_quote first to find the poolId and estimate output. " +
      "Returns the transaction signature on success.",
  })
  async orbitSwap(
    parameters: SwapParameters,
    walletClient: SolanaWalletClient
  ) {
    const { CipherDlmm } = await import("orbit-dlmm").catch(() => {
      throw new Error(
        "orbit-dlmm package is required for swap operations. Install it: npm install orbit-dlmm"
      );
    });

    const poolAddress = new PublicKey(parameters.poolId);
    const dlmm = await CipherDlmm.create(this.connection, poolAddress, {
      programId: new PublicKey(ORBIT_PROGRAM_ID),
    });

    const pool = dlmm.pool;
    const isXtoY = pool.baseMint.toBase58() === parameters.inputMint;
    const inDecimals = isXtoY ? pool.baseDecimals : pool.quoteDecimals;

    const inAmountBn = toBaseUnits(parameters.amount, inDecimals);
    const minOutAmount = BigInt(0);

    const tx: VersionedTransaction = await dlmm.swap({
      user: new PublicKey(walletClient.getAddress()),
      amountIn: inAmountBn,
      minAmountOut: minOutAmount,
      swapForBase: !isXtoY,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const instructions = await walletClient.decompileVersionedTransactionToInstructions(tx as any);
    const { hash } = await walletClient.sendTransaction({ instructions });

    return {
      transactionHash: hash,
      poolId: parameters.poolId,
      inputMint: parameters.inputMint,
      outputMint: parameters.outputMint,
      inputAmount: parameters.amount,
    };
  }

  @Tool({
    description:
      "Add liquidity to an Orbit Finance DLMM pool. Opens a new position across a specified bin range. " +
      "Returns the transaction signature. Max range: 64 bins. " +
      "Use get_orbit_pool_info to find activeBinId as a reference.",
  })
  async orbitAddLiquidity(
    parameters: AddLiquidityParameters,
    walletClient: SolanaWalletClient
  ) {
    const { CipherDlmm } = await import("orbit-dlmm").catch(() => {
      throw new Error(
        "orbit-dlmm package is required for liquidity operations. Install it: npm install orbit-dlmm"
      );
    });

    if (parameters.upperBinId - parameters.lowerBinId > 63) {
      throw new Error(
        `Bin range too wide: ${parameters.upperBinId - parameters.lowerBinId} bins. Maximum is 64.`
      );
    }

    const poolAddress = new PublicKey(parameters.poolId);
    const dlmm = await CipherDlmm.create(this.connection, poolAddress, {
      programId: new PublicKey(ORBIT_PROGRAM_ID),
    });

    const pool = dlmm.pool;
    const user = new PublicKey(walletClient.getAddress());

    const xAmountBn = toBaseUnits(parameters.amountX, pool.baseDecimals);
    const yAmountBn = toBaseUnits(parameters.amountY, pool.quoteDecimals);

    const strategyMap: Record<string, string> = {
      bid_ask: "bid-ask",
      balanced: "curve",
    };
    const sdkStrategy = (strategyMap[parameters.strategy] ?? parameters.strategy) as DistributionStrategy;

    const txs: VersionedTransaction[] = await dlmm.addLiquidityByStrategy({
      user,
      positionNonce: 0n,
      totalBaseAmount: xAmountBn,
      totalQuoteAmount: yAmountBn,
      strategy: sdkStrategy,
      minBinId: parameters.lowerBinId,
      maxBinId: parameters.upperBinId,
    });

    let lastHash = "";
    for (const vtx of txs) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const instructions = await walletClient.decompileVersionedTransactionToInstructions(vtx as any);
      const result = await walletClient.sendTransaction({ instructions });
      lastHash = result.hash;
    }

    return {
      transactionHash: lastHash,
      poolId: parameters.poolId,
      lowerBinId: parameters.lowerBinId,
      upperBinId: parameters.upperBinId,
      amountX: parameters.amountX,
      amountY: parameters.amountY,
      strategy: parameters.strategy,
    };
  }

  @Tool({
    description:
      "Remove liquidity from an Orbit Finance DLMM position. " +
      "Withdraws token X and token Y back to the wallet and optionally closes the position. " +
      "Set bpsToRemove=10000 to fully close (default). Returns the transaction signature.",
  })
  async orbitRemoveLiquidity(
    parameters: RemoveLiquidityParameters,
    walletClient: SolanaWalletClient
  ) {
    const { CipherDlmm } = await import("orbit-dlmm").catch(() => {
      throw new Error(
        "orbit-dlmm package is required for liquidity operations. Install it: npm install orbit-dlmm"
      );
    });

    const poolAddress = new PublicKey(parameters.poolId);
    const dlmm = await CipherDlmm.create(this.connection, poolAddress, {
      programId: new PublicKey(ORBIT_PROGRAM_ID),
    });

    const user = new PublicKey(walletClient.getAddress());
    const positionAddress = new PublicKey(parameters.positionId);

    const tx: VersionedTransaction = await dlmm.removeLiquidity({
      user,
      position: positionAddress,
      bpsPct: parameters.bpsToRemove,
      shouldClaimAndClose: parameters.bpsToRemove >= 10000,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const instructions = await walletClient.decompileVersionedTransactionToInstructions(tx as any);
    const { hash } = await walletClient.sendTransaction({ instructions });

    return {
      transactionHash: hash,
      poolId: parameters.poolId,
      positionId: parameters.positionId,
      bpsRemoved: parameters.bpsToRemove,
      positionClosed: parameters.bpsToRemove >= 10000,
    };
  }
}
