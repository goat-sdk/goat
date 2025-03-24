import "reflect-metadata";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { z } from "zod";
import { Tool } from "../../decorators/Tool";
import { createToolParameters } from "../../utils/createToolParameters";
import { WalletClientBase } from "../../classes";
import { EvmChain } from "../../types/Chain";
import { mockWalletClient } from "./mock-utils";

// Parameter classes for wallet operations
export class BalanceCheckParams extends createToolParameters(
  z.object({
    address: z.string().optional().describe("Address to check balance for (defaults to wallet address)"),
    token: z.string().optional().describe("Token address to check balance for (defaults to native token)")
  })
) {
  static override schema = z.object({
    address: z.string().optional().describe("Address to check balance for (defaults to wallet address)"),
    token: z.string().optional().describe("Token address to check balance for (defaults to native token)")
  });
}

export class TransferParams extends createToolParameters(
  z.object({
    to: z.string().describe("Recipient address"),
    amount: z.string().describe("Amount to transfer"),
    token: z.string().optional().describe("Token address (defaults to native token)")
  })
) {
  static override schema = z.object({
    to: z.string().describe("Recipient address"),
    amount: z.string().describe("Amount to transfer"),
    token: z.string().optional().describe("Token address (defaults to native token)")
  });
}

// Service with wallet operation tools
class BalanceService {
  balanceCheckSpy = vi.fn().mockResolvedValue({ 
    balance: "100", 
    symbol: "ETH", 
    decimals: 18 
  });
  
  transferSpy = vi.fn().mockResolvedValue({ 
    txHash: "0xmocktxhash", 
    success: true 
  });

  @Tool({
    name: "check_balance",
    description: "Check the balance of an address"
  })
  async checkBalance(wallet: WalletClientBase, parameters: BalanceCheckParams) {
    const address = parameters.address || wallet.getAddress();
    const token = parameters.token;
    return this.balanceCheckSpy(wallet, address, token);
  }

  @Tool({
    name: "transfer",
    description: "Transfer tokens to an address"
  })
  async transfer(wallet: WalletClientBase, parameters: TransferParams) {
    const { to, amount, token } = parameters;
    return this.transferSpy(wallet, to, amount, token);
  }
}

describe("Basic Wallet Operations", () => {
  let service: BalanceService;
  let wallet: WalletClientBase;

  beforeEach(() => {
    service = new BalanceService();
    wallet = mockWalletClient();
  });

  describe("Balance Check Tool", () => {
    it("should check balance with default parameters", async () => {
      const params = new BalanceCheckParams();
      
      const result = await service.checkBalance(wallet, params);
      
      expect(result).toEqual({ 
        balance: "100", 
        symbol: "ETH", 
        decimals: 18 
      });
      expect(service.balanceCheckSpy).toHaveBeenCalledWith(
        wallet, 
        "0xmockaddress", 
        undefined
      );
    });

    it("should check balance with custom address", async () => {
      const params = new BalanceCheckParams();
      params.address = "0xcustomaddress";
      
      await service.checkBalance(wallet, params);
      
      expect(service.balanceCheckSpy).toHaveBeenCalledWith(
        wallet, 
        "0xcustomaddress", 
        undefined
      );
    });

    it("should check token balance", async () => {
      const params = new BalanceCheckParams();
      params.token = "0xtokenaddress";
      
      await service.checkBalance(wallet, params);
      
      expect(service.balanceCheckSpy).toHaveBeenCalledWith(
        wallet, 
        "0xmockaddress", 
        "0xtokenaddress"
      );
    });
  });

  describe("Transfer Tool", () => {
    it("should transfer tokens", async () => {
      const params = new TransferParams();
      params.to = "0xrecipient";
      params.amount = "1.0";
      
      const result = await service.transfer(wallet, params);
      
      expect(result).toEqual({ 
        txHash: "0xmocktxhash", 
        success: true 
      });
      expect(service.transferSpy).toHaveBeenCalledWith(
        wallet, 
        "0xrecipient", 
        "1.0", 
        undefined
      );
    });

    it("should transfer specific token", async () => {
      const params = new TransferParams();
      params.to = "0xrecipient";
      params.amount = "10.0";
      params.token = "0xtokenaddress";
      
      await service.transfer(wallet, params);
      
      expect(service.transferSpy).toHaveBeenCalledWith(
        wallet, 
        "0xrecipient", 
        "10.0", 
        "0xtokenaddress"
      );
    });
  });
});
