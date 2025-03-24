import "reflect-metadata";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { Tool } from "../../decorators/Tool";
import { createToolParameters } from "../../utils/createToolParameters";
import { WalletClientBase } from "../../classes";
import { mockWalletClient } from "./mock-utils";

// Parameter classes for token operations
export class TokenSwapParams extends createToolParameters(
  z.object({
    fromToken: z.string().describe("Source token address or symbol"),
    toToken: z.string().describe("Destination token address or symbol"),
    amount: z.string().describe("Amount to swap"),
    slippage: z.number().optional().default(0.5).describe("Maximum slippage percentage")
  })
) {
  static override schema = z.object({
    fromToken: z.string().describe("Source token address or symbol"),
    toToken: z.string().describe("Destination token address or symbol"),
    amount: z.string().describe("Amount to swap"),
    slippage: z.number().optional().default(0.5).describe("Maximum slippage percentage")
  });
}

export class TokenApproveParams extends createToolParameters(
  z.object({
    token: z.string().describe("Token address to approve"),
    spender: z.string().describe("Address to approve for spending"),
    amount: z.string().optional().describe("Amount to approve (defaults to unlimited)")
  })
) {
  static override schema = z.object({
    token: z.string().describe("Token address to approve"),
    spender: z.string().describe("Address to approve for spending"),
    amount: z.string().optional().describe("Amount to approve (defaults to unlimited)")
  });
}

// Service with token operation tools
class TokenService {
  swapSpy = vi.fn().mockResolvedValue({ 
    txHash: "0xmockswaphash", 
    fromAmount: "1.0",
    toAmount: "10.5",
    success: true 
  });
  
  approveSpy = vi.fn().mockResolvedValue({ 
    txHash: "0xmockapprovalHash", 
    success: true 
  });

  @Tool({
    name: "swap_tokens",
    description: "Swap one token for another"
  })
  async swapTokens(wallet: WalletClientBase, parameters: TokenSwapParams) {
    const { fromToken, toToken, amount, slippage = 0.5 } = parameters;
    return this.swapSpy(wallet, fromToken, toToken, amount, slippage);
  }

  @Tool({
    name: "approve_token",
    description: "Approve a spender to use tokens"
  })
  async approveToken(wallet: WalletClientBase, parameters: TokenApproveParams) {
    const { token, spender, amount } = parameters;
    return this.approveSpy(wallet, token, spender, amount);
  }
}

describe("Token Operations", () => {
  let service: TokenService;
  let wallet: WalletClientBase;

  beforeEach(() => {
    service = new TokenService();
    wallet = mockWalletClient();
  });

  describe("Token Swap Tool", () => {
    it("should swap tokens with default slippage", async () => {
      const params = new TokenSwapParams();
      params.fromToken = "ETH";
      params.toToken = "USDC";
      params.amount = "1.0";
      
      const result = await service.swapTokens(wallet, params);
      
      expect(result).toEqual({ 
        txHash: "0xmockswaphash", 
        fromAmount: "1.0",
        toAmount: "10.5",
        success: true 
      });
      expect(service.swapSpy).toHaveBeenCalledWith(
        wallet, 
        "ETH", 
        "USDC", 
        "1.0", 
        0.5
      );
    });

    it("should swap tokens with custom slippage", async () => {
      const params = new TokenSwapParams();
      params.fromToken = "USDC";
      params.toToken = "DAI";
      params.amount = "100";
      params.slippage = 1.0;
      
      await service.swapTokens(wallet, params);
      
      expect(service.swapSpy).toHaveBeenCalledWith(
        wallet, 
        "USDC", 
        "DAI", 
        "100", 
        1.0
      );
    });
  });

  describe("Token Approve Tool", () => {
    it("should approve token spending", async () => {
      const params = new TokenApproveParams();
      params.token = "0xtokenaddress";
      params.spender = "0xspenderaddress";
      
      const result = await service.approveToken(wallet, params);
      
      expect(result).toEqual({ 
        txHash: "0xmockapprovalHash", 
        success: true 
      });
      expect(service.approveSpy).toHaveBeenCalledWith(
        wallet, 
        "0xtokenaddress", 
        "0xspenderaddress", 
        undefined
      );
    });

    it("should approve token spending with specific amount", async () => {
      const params = new TokenApproveParams();
      params.token = "0xtokenaddress";
      params.spender = "0xspenderaddress";
      params.amount = "100";
      
      await service.approveToken(wallet, params);
      
      expect(service.approveSpy).toHaveBeenCalledWith(
        wallet, 
        "0xtokenaddress", 
        "0xspenderaddress", 
        "100"
      );
    });
  });
});
