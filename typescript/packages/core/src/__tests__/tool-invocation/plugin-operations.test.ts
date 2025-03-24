import "reflect-metadata";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { Tool } from "../../decorators/Tool";
import { createToolParameters } from "../../utils/createToolParameters";
import { WalletClientBase } from "../../classes";
import { mockWalletClient } from "./mock-utils";

// Parameter classes for plugin operations
export class PriceCheckParams extends createToolParameters(
  z.object({
    coinId: z.string().describe("ID of the coin to check price for"),
    currency: z.string().optional().default("usd").describe("Currency to get price in")
  })
) {
  static override schema = z.object({
    coinId: z.string().describe("ID of the coin to check price for"),
    currency: z.string().optional().default("usd").describe("Currency to get price in")
  });
}

export class DeployContractParams extends createToolParameters(
  z.object({
    bytecode: z.string().describe("Contract bytecode"),
    abi: z.string().describe("Contract ABI"),
    constructorArgs: z.array(z.any()).optional().describe("Constructor arguments")
  })
) {
  static override schema = z.object({
    bytecode: z.string().describe("Contract bytecode"),
    abi: z.string().describe("Contract ABI"),
    constructorArgs: z.array(z.any()).optional().describe("Constructor arguments")
  });
}

// Service with plugin operation tools
class PluginService {
  priceCheckSpy = vi.fn().mockResolvedValue({ 
    price: 1234.56,
    currency: "usd",
    lastUpdated: "2023-01-01T00:00:00Z"
  });
  
  deployContractSpy = vi.fn().mockResolvedValue({ 
    txHash: "0xmockdeployhash", 
    contractAddress: "0xdeployedcontract",
    success: true 
  });

  @Tool({
    name: "check_price",
    description: "Check the price of a cryptocurrency"
  })
  async checkPrice(parameters: PriceCheckParams) {
    const { coinId, currency = "usd" } = parameters;
    return this.priceCheckSpy(coinId, currency);
  }

  @Tool({
    name: "deploy_contract",
    description: "Deploy a smart contract"
  })
  async deployContract(wallet: WalletClientBase, parameters: DeployContractParams) {
    const { bytecode, abi, constructorArgs } = parameters;
    return this.deployContractSpy(wallet, bytecode, abi, constructorArgs);
  }
}

describe("Plugin Operations", () => {
  let service: PluginService;
  let wallet: WalletClientBase;

  beforeEach(() => {
    service = new PluginService();
    wallet = mockWalletClient();
  });

  describe("Price Check Tool", () => {
    it("should check price with default currency", async () => {
      const params = new PriceCheckParams();
      params.coinId = "bitcoin";
      
      const result = await service.checkPrice(params);
      
      expect(result).toEqual({ 
        price: 1234.56,
        currency: "usd",
        lastUpdated: "2023-01-01T00:00:00Z"
      });
      expect(service.priceCheckSpy).toHaveBeenCalledWith(
        "bitcoin", 
        "usd"
      );
    });

    it("should check price with custom currency", async () => {
      const params = new PriceCheckParams();
      params.coinId = "ethereum";
      params.currency = "eur";
      
      await service.checkPrice(params);
      
      expect(service.priceCheckSpy).toHaveBeenCalledWith(
        "ethereum", 
        "eur"
      );
    });
  });

  describe("Deploy Contract Tool", () => {
    it("should deploy contract without constructor args", async () => {
      const params = new DeployContractParams();
      params.bytecode = "0xbytecode";
      params.abi = JSON.stringify([]);
      
      const result = await service.deployContract(wallet, params);
      
      expect(result).toEqual({ 
        txHash: "0xmockdeployhash", 
        contractAddress: "0xdeployedcontract",
        success: true 
      });
      expect(service.deployContractSpy).toHaveBeenCalledWith(
        wallet, 
        "0xbytecode", 
        JSON.stringify([]), 
        undefined
      );
    });

    it("should deploy contract with constructor args", async () => {
      const params = new DeployContractParams();
      params.bytecode = "0xbytecode";
      params.abi = JSON.stringify([]);
      params.constructorArgs = ["arg1", 123];
      
      await service.deployContract(wallet, params);
      
      expect(service.deployContractSpy).toHaveBeenCalledWith(
        wallet, 
        "0xbytecode", 
        JSON.stringify([]), 
        ["arg1", 123]
      );
    });
  });
});
