import "reflect-metadata";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { Tool } from "../../decorators/Tool";
import { createToolParameters } from "../../utils/createToolParameters";
import { WalletClientBase } from "../../classes";
import { EvmChain } from "../../types/Chain";

import { mockWalletClient } from "./mock-utils";

/**
 * Pattern 1: Parameters class with static schema (CoinGecko pattern)
 */
export class CoinGeckoParams extends createToolParameters(
  z.object({
    value: z.string().describe("Test value")
  })
) {
  // Explicitly define schema to match parent class
  static override schema = z.object({
    value: z.string().describe("Test value")
  });
}

/**
 * Pattern 2: Parameters using const variable (0x pattern)
 */
const ZeroExParams = createToolParameters(
  z.object({
    value: z.string().describe("Test value")
  })
);

/**
 * Test service demonstrating different Tool decorator patterns
 */
class TestService {
  /**
   * Pattern 1: CoinGecko pattern - parameters only
   */
  @Tool({
    name: "coingecko_pattern",
    description: "Test tool method using CoinGecko pattern"
  })
  async coinGeckoPattern(parameters: CoinGeckoParams) {
    return { 
      success: true,
      pattern: "coingecko",
      value: parameters.value 
    };
  }

  /**
   * Pattern 2: 0x pattern - wallet and parameters
   */
  @Tool({
    name: "zerox_pattern",
    description: "Test tool method using 0x pattern"
  })
  async zeroXPattern(wallet: WalletClientBase, parameters: InstanceType<typeof ZeroExParams>) {
    return { 
      success: true, 
      pattern: "0x",
      wallet: wallet.getAddress(),
      value: parameters.value 
    };
  }

  /**
   * Pattern 3: Etherscan pattern - wallet and class parameters
   */
  @Tool({
    name: "etherscan_pattern",
    description: "Test tool method using Etherscan pattern"
  })
  async etherscanPattern(wallet: WalletClientBase, parameters: CoinGeckoParams) {
    return { 
      success: true, 
      pattern: "etherscan",
      wallet: wallet.getAddress(),
      value: parameters.value 
    };
  }
}

describe("Tool decorator patterns test", () => {
  it("should correctly detect parameters for CoinGecko pattern", () => {
    const service = new TestService();
    expect(service.coinGeckoPattern).toBeDefined();
    expect(CoinGeckoParams.schema).toBeDefined();
  });
  
  it("should correctly detect parameters for 0x pattern", () => {
    const service = new TestService();
    expect(service.zeroXPattern).toBeDefined();
    expect(ZeroExParams.prototype.constructor.schema).toBeDefined();
  });
  
  it("should correctly detect parameters for Etherscan pattern", () => {
    const service = new TestService();
    expect(service.etherscanPattern).toBeDefined();
  });
  
  it("should execute the CoinGecko pattern method with correct parameters", async () => {
    const service = new TestService();
    const params = new CoinGeckoParams();
    params.value = "test-value";
    
    const result = await service.coinGeckoPattern(params);
    expect(result).toEqual({ 
      success: true,
      pattern: "coingecko",
      value: "test-value" 
    });
  });
  
  it("should execute the 0x pattern method with correct parameters", async () => {
    const service = new TestService();
    const wallet = mockWalletClient();
    const params = { value: "test-value" };
    
    const result = await service.zeroXPattern(wallet, params as InstanceType<typeof ZeroExParams>);
    expect(result).toEqual({ 
      success: true, 
      pattern: "0x",
      wallet: "0xmockaddress",
      value: "test-value" 
    });
  });
  
  it("should execute the Etherscan pattern method with correct parameters", async () => {
    const service = new TestService();
    const wallet = mockWalletClient();
    const params = new CoinGeckoParams();
    params.value = "test-value";
    
    const result = await service.etherscanPattern(wallet, params);
    expect(result).toEqual({ 
      success: true, 
      pattern: "etherscan",
      wallet: "0xmockaddress",
      value: "test-value" 
    });
  });
});
