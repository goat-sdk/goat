import { PluginBase, Tool } from "@goat-sdk/core";
import type { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { KyberswapService } from "./kyberswap.service";
import { GetQuoteParameters, SwapParameters, ZapInParameters } from "./parameters";

export class KyberswapPlugin extends PluginBase<EVMWalletClient> {
  private service: KyberswapService;

  constructor() {
    super("kyberswap", []);
    this.service = new KyberswapService();
  }

  supportsChain(chain: { type: string }) {
    return chain.type === "evm";
  }

  @Tool({
    name: "kyberswap_get_quote",
    description:
      "Get a swap quote from KyberSwap DEX Aggregator. Returns best exchange rate, route breakdown, and estimated gas across multiple liquidity sources on EVM chains (Ethereum, Arbitrum, Base, Polygon, BSC, Optimism, Avalanche, and more). Use this before swapping to check rates.",
  })
  async getQuote(walletClient: EVMWalletClient, parameters: GetQuoteParameters) {
    return this.service.getQuote(parameters);
  }

  @Tool({
    name: "kyberswap_swap",
    description:
      "Execute a token swap via KyberSwap DEX Aggregator. Finds the best route across multiple liquidity pools and executes in a single transaction. " +
      "IMPORTANT: If tokenIn is an ERC-20 (not native ETH/BNB/etc.), you must approve the routerAddress before calling this tool. " +
      "Call kyberswap_get_quote first to get the routerAddress, then approve, then swap.",
  })
  async swap(walletClient: EVMWalletClient, parameters: SwapParameters) {
    const sender = await walletClient.getAddress();
    const { transaction, quote } = await this.service.buildSwap({ ...parameters, sender });

    const txHash = await walletClient.sendTransaction({
      to: transaction.to as `0x${string}`,
      data: transaction.data as `0x${string}`,
      value: BigInt(transaction.value ?? "0"),
    });

    return {
      transactionHash: txHash,
      swap: {
        tokenIn: quote.tokenIn,
        tokenOut: quote.tokenOut,
        exchangeRate: quote.exchangeRate,
      },
      chain: quote.chain,
    };
  }

  @Tool({
    name: "kyberswap_zap_in",
    description:
      "Add liquidity to a concentrated liquidity pool in a single transaction using KyberSwap Zap. " +
      "Accepts a single input token and automatically handles any required swaps + LP position creation. " +
      "Supports Uniswap V3, KyberSwap Elastic, and other CL pools on supported chains. " +
      "IMPORTANT: Approve tokenIn to the approvalTarget returned before calling if tokenIn is an ERC-20.",
  })
  async zapIn(walletClient: EVMWalletClient, parameters: ZapInParameters) {
    const sender = await walletClient.getAddress();
    const { transaction, chain, pool, dex } = await this.service.buildZapIn({ ...parameters, sender });

    const txHash = await walletClient.sendTransaction({
      to: transaction.to as `0x${string}`,
      data: transaction.data as `0x${string}`,
      value: BigInt(transaction.value ?? "0"),
    });

    return {
      transactionHash: txHash,
      zapIn: { pool, dex, chain },
    };
  }
}
