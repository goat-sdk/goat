import { Chain, Plugin, Tool, WalletClient } from "@goat-sdk/core";
import { SwapParamsSchema, LiquidityParamsSchema } from "./types";
import { performSwap } from "./methods/swap";
import { provideLiquidity } from "./methods/liquidity";

export function balancerPlugin(): Plugin<WalletClient> {
  return {
    name: "Balancer",
    
    // Note: Here we Support EVM chains only as Balancer is Evm based Dex
    supportsChain: (chain: Chain) => chain.type === "evm",
    
   
    supportsSmartWallets: () => true,
    
    getTools: async (wallet: WalletClient): Promise<Tool[]> => {
      return [
        {
          name: "balancer_swap",
          description: "This {{tool}} performs a token swap on Balancer using their Smart Order Router",
          parameters: SwapParamsSchema,
          method: (params: any) => performSwap(wallet, params),
        },
        {
          name: "balancer_add_liquidity",
          description: "This {{tool}} provides liquidity to a Balancer pool",
          parameters: LiquidityParamsSchema, 
          method: (params: any) => provideLiquidity(wallet, params),
        }
      ];
    }
  };
} 