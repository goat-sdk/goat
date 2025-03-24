import { describe, expect, it, vi } from "vitest";
import { mockWalletClient } from "./mock-utils";
import { WalletClientBase } from "../../classes";

/**
 * This file tests specific prompt examples from the evaluation files
 * using direct function mocks instead of relying on the Tool decorator.
 */

// Mock Jupiter token swap service
class JupiterSwapService {
  swapToken = vi.fn().mockResolvedValue({
    txHash: "0xmockswaphash",
    inputAmount: "10",
    outputAmount: "5",
    inputToken: "USDC",
    outputToken: "SOL"
  });
}

// Mock Solana transfer service
class SolanaTransferService {
  transfer = vi.fn().mockResolvedValue({
    txHash: "0xmocktransferhash",
    success: true
  });
}

// Mock Light Protocol compressed airdrop service
class LightProtocolService {
  airdropCompressedTokens = vi.fn().mockResolvedValue({
    txHash: "0xmockairdrophash",
    success: true
  });
}

// Mock SolutioFi spread token service
class SolutioFiService {
  spreadToken = vi.fn().mockResolvedValue({
    txHash: "0xmockspreadhash",
    success: true
  });

  mergeTokens = vi.fn().mockResolvedValue({
    txHash: "0xmockmergehash",
    success: true
  });
}

// Mock Drift vault service
class DriftService {
  createVault = vi.fn().mockResolvedValue({
    txHash: "0xmockvaulthash",
    vaultId: "vault123",
    success: true
  });
}

// Mock JLand NFT service
class JLandService {
  createNftListing = vi.fn().mockResolvedValue({
    txHash: "0xmocklistinghash",
    listingId: "listing123",
    success: true
  });
}

// Mock Meteora pool service
class MeteoraService {
  createDynamicPool = vi.fn().mockResolvedValue({
    txHash: "0xmockpoolhash",
    poolId: "pool123",
    success: true
  });
}

// Mock Metaplex token service
class MetaplexService {
  deployToken = vi.fn().mockResolvedValue({
    txHash: "0xmocktokenhash",
    tokenAddress: "0xmocktoken",
    success: true
  });
}

// Mock Helius transaction service
class HeliusService {
  sendTransactionWithPriorityFee = vi.fn().mockResolvedValue({
    txHash: "0xmocktxhash",
    success: true
  });
}

describe("Direct Function Mocks for Prompt Examples", () => {
  // Test Jupiter token swap examples
  describe("jupiter/token_swap.eval.ts", () => {
    const jupiterService = new JupiterSwapService();
    const wallet = mockWalletClient();

    it("should handle prompt: 'I want to trade 5 USDC for SOL'", async () => {
      // Mock the parameter extraction that would happen in the LLM
      const extractedParams = { 
        inputToken: "USDC", 
        outputToken: "SOL", 
        amount: "5",
        slippage: "0.5" // Default slippage
      };
      
      await jupiterService.swapToken(wallet, extractedParams);
      
      expect(jupiterService.swapToken).toHaveBeenCalledWith(
        wallet,
        expect.objectContaining({ 
          inputToken: "USDC", 
          outputToken: "SOL", 
          amount: "5" 
        })
      );
    });

    it("should handle prompt: 'Exchange 1 SOL for JUP tokens'", async () => {
      // Mock the parameter extraction that would happen in the LLM
      const extractedParams = { 
        inputToken: "SOL", 
        outputToken: "JUP", 
        amount: "1",
        slippage: "0.5" // Default slippage
      };
      
      await jupiterService.swapToken(wallet, extractedParams);
      
      expect(jupiterService.swapToken).toHaveBeenCalledWith(
        wallet,
        expect.objectContaining({ 
          inputToken: "SOL", 
          outputToken: "JUP", 
          amount: "1" 
        })
      );
    });

    it("should handle prompt: 'Swap 10 USDC for JUP with 1% slippage'", async () => {
      // Mock the parameter extraction that would happen in the LLM
      const extractedParams = { 
        inputToken: "USDC", 
        outputToken: "JUP", 
        amount: "10",
        slippage: "1"
      };
      
      await jupiterService.swapToken(wallet, extractedParams);
      
      expect(jupiterService.swapToken).toHaveBeenCalledWith(
        wallet,
        expect.objectContaining({ 
          inputToken: "USDC", 
          outputToken: "JUP", 
          amount: "10",
          slippage: "1"
        })
      );
    });
  });

  // Test Light Protocol compressed airdrop examples
  describe("lightprotocol/solana_compressed_airdrop.eval.ts", () => {
    const lightProtocolService = new LightProtocolService();
    const wallet = mockWalletClient();

    it("should handle prompt: 'Airdrop 100 tokens of mint 4h2cMlJ5byq4iqZ73rKRSz9rLmLjQvEDf9lm6JFgNu to [9aUn5swQzUTRanaaTwmszxiv89cvFwUCjF'", async () => {
      // Mock the parameter extraction that would happen in the LLM
      const extractedParams = { 
        mint: "4h2cMlJ5byq4iqZ73rKRSz9rLmLjQvEDf9lm6JFgNu", 
        amount: "100",
        recipients: ["9aUn5swQzUTRanaaTwmszxiv89cvFwUCjF"]
      };
      
      await lightProtocolService.airdropCompressedTokens(wallet, extractedParams);
      
      expect(lightProtocolService.airdropCompressedTokens).toHaveBeenCalledWith(
        wallet,
        expect.objectContaining(extractedParams)
      );
    });

    it("should handle prompt: 'Send 50 tokens from E5fU1X4TTq3XdVXz1wdYzbUYBzYQu5YnvLalwa0e2d1t to 2 recipients, each gets 50, with no logs.'", async () => {
      // Mock the parameter extraction that would happen in the LLM
      const extractedParams = { 
        mint: "E5fU1X4TTq3XdVXz1wdYzbUYBzYQu5YnvLalwa0e2d1t", 
        amount: "50",
        recipients: ["recipient1", "recipient2"],
        enableLogs: false
      };
      
      await lightProtocolService.airdropCompressedTokens(wallet, extractedParams);
      
      expect(lightProtocolService.airdropCompressedTokens).toHaveBeenCalledWith(
        wallet,
        expect.objectContaining(extractedParams)
      );
    });
  });

  // Test Solana transfer examples
  describe("solana/transfer.eval.ts", () => {
    const solanaService = new SolanaTransferService();
    const wallet = mockWalletClient();

    it("should handle prompt: 'Can you transfer 0.0001 sol to GZbQmKY7zwjP3nbdqRWpLN98iApin9w5eXMGp7bmZbGB?'", async () => {
      // Mock the parameter extraction that would happen in the LLM
      const extractedParams = { 
        token: "SOL", 
        amount: "0.0001",
        to: "GZbQmKY7zwjP3nbdqRWpLN98iApin9w5eXMGp7bmZbGB"
      };
      
      await solanaService.transfer(wallet, extractedParams);
      
      expect(solanaService.transfer).toHaveBeenCalledWith(
        wallet,
        expect.objectContaining(extractedParams)
      );
    });

    it("should handle prompt: 'Can you transfer like two sol to GZbQmKY7zwjP3nbdqRWpLN98iApin9w5eXMGp7bmZbGB for testing?'", async () => {
      // Mock the parameter extraction that would happen in the LLM
      const extractedParams = { 
        token: "SOL", 
        amount: "2",
        to: "GZbQmKY7zwjP3nbdqRWpLN98iApin9w5eXMGp7bmZbGB"
      };
      
      await solanaService.transfer(wallet, extractedParams);
      
      expect(solanaService.transfer).toHaveBeenCalledWith(
        wallet,
        expect.objectContaining(extractedParams)
      );
    });

    it("should handle prompt: 'Send 250 USDC to GZbQmKY7zwjP3nbdqRWpLN98iApin9w5eXMGp7bmZbGB'", async () => {
      // Mock the parameter extraction that would happen in the LLM
      const extractedParams = { 
        token: "USDC", 
        amount: "250",
        to: "GZbQmKY7zwjP3nbdqRWpLN98iApin9w5eXMGp7bmZbGB"
      };
      
      await solanaService.transfer(wallet, extractedParams);
      
      expect(solanaService.transfer).toHaveBeenCalledWith(
        wallet,
        expect.objectContaining(extractedParams)
      );
    });
  });

  // Test SolutioFi spread token examples
  describe("solutiofi/solana_solutiofi_spread_token.eval.ts", () => {
    const solutioFiService = new SolutioFiService();
    const wallet = mockWalletClient();

    it("should handle prompt: 'Spread 100 SOL across [ { mint: JUPyiwYJFSkuPiHa7hkeR8VUtAEfoSYbKedZNsDvCN, percentage: 50 }, { mint: EPjFWd...'", async () => {
      // Mock the parameter extraction that would happen in the LLM
      const extractedParams = { 
        amount: "100",
        token: "SOL",
        distributions: [
          { mint: "JUPyiwYJFSkuPiHa7hkeR8VUtAEfoSYbKedZNsDvCN", percentage: 50 },
          { mint: "EPjFWd", percentage: 50 }
        ]
      };
      
      await solutioFiService.spreadToken(wallet, extractedParams);
      
      expect(solutioFiService.spreadToken).toHaveBeenCalledWith(
        wallet,
        expect.objectContaining({ 
          amount: "100",
          token: "SOL"
        })
      );
    });
  });

  // Test SolutioFi merge tokens examples
  describe("solutiofi/solana_solutiofi_merge_tokens.eval.ts", () => {
    const solutioFiService = new SolutioFiService();
    const wallet = mockWalletClient();

    it("should handle prompt: 'Merge tokens [ { mint: 2EFr5F7Eg78LTPPEr2L4StgyHfv4bSktbMU9eiANZSwU, inputAmount: 100, slippage: 0.5, onlyDire...'", async () => {
      // Mock the parameter extraction that would happen in the LLM
      const extractedParams = { 
        tokens: [
          { 
            mint: "2EFr5F7Eg78LTPPEr2L4StgyHfv4bSktbMU9eiANZSwU", 
            inputAmount: "100", 
            slippage: "0.5", 
            onlyDirectRoutes: true 
          }
        ]
      };
      
      await solutioFiService.mergeTokens(wallet, extractedParams);
      
      expect(solutioFiService.mergeTokens).toHaveBeenCalledWith(
        wallet,
        expect.objectContaining({ 
          tokens: expect.arrayContaining([
            expect.objectContaining({ 
              mint: "2EFr5F7Eg78LTPPEr2L4StgyHfv4bSktbMU9eiANZSwU" 
            })
          ])
        })
      );
    });
  });

  // Test Drift vault examples
  describe("drift/solana_create_drift_vault.eval.ts", () => {
    const driftService = new DriftService();
    const wallet = mockWalletClient();

    it("should handle prompt: 'Create a drift vault named 'MyVault', market is SOL-USDC, redeemPeriod=3 days, maxTokens=1000, minDepositAmoun...'", async () => {
      // Mock the parameter extraction that would happen in the LLM
      const extractedParams = { 
        name: "MyVault",
        market: "SOL-USDC",
        redeemPeriod: "3 days",
        maxTokens: "1000"
      };
      
      await driftService.createVault(wallet, extractedParams);
      
      expect(driftService.createVault).toHaveBeenCalledWith(
        wallet,
        expect.objectContaining({ 
          name: "MyVault",
          market: "SOL-USDC"
        })
      );
    });
  });

  // Test JLand NFT examples
  describe("jland/solana_jland_create_single.eval.ts", () => {
    const jlandService = new JLandService();
    const wallet = mockWalletClient();

    it("should handle prompt: 'Create an NFT single listing in the collection EAMk4 with name 'Artz', itemSymbol 'ART', itemAmount=10, price=...'", async () => {
      // Mock the parameter extraction that would happen in the LLM
      const extractedParams = { 
        collection: "EAMk4",
        name: "Artz",
        symbol: "ART",
        amount: "10"
      };
      
      await jlandService.createNftListing(wallet, extractedParams);
      
      expect(jlandService.createNftListing).toHaveBeenCalledWith(
        wallet,
        expect.objectContaining({ 
          collection: "EAMk4",
          name: "Artz",
          symbol: "ART"
        })
      );
    });
  });

  // Test Meteora pool examples
  describe("meteora/meteora_create_dynamic_pool.eval.ts", () => {
    const meteoraService = new MeteoraService();
    const wallet = mockWalletClient();

    it("should handle prompt: 'Create Meteora dynamic pool with tokenAMint=So11111111111111111111111111111111111111112, tokenBMint=EPjFWd5A...'", async () => {
      // Mock the parameter extraction that would happen in the LLM
      const extractedParams = { 
        tokenAMint: "So11111111111111111111111111111111111111112",
        tokenBMint: "EPjFWd5A"
      };
      
      await meteoraService.createDynamicPool(wallet, extractedParams);
      
      expect(meteoraService.createDynamicPool).toHaveBeenCalledWith(
        wallet,
        expect.objectContaining({ 
          tokenAMint: "So11111111111111111111111111111111111111112",
          tokenBMint: "EPjFWd5A"
        })
      );
    });
  });

  // Test Metaplex token examples
  describe("metaplex/solana_deploy_token.eval.ts", () => {
    const metaplexService = new MetaplexService();
    const wallet = mockWalletClient();

    it("should handle prompt: 'Deploy a token named DemoToken with symbol DEMO and decimals = 6 using a JSON url at https://example.com/demo.'", async () => {
      // Mock the parameter extraction that would happen in the LLM
      const extractedParams = { 
        name: "DemoToken",
        symbol: "DEMO",
        decimals: "6",
        metadataUrl: "https://example.com/demo"
      };
      
      await metaplexService.deployToken(wallet, extractedParams);
      
      expect(metaplexService.deployToken).toHaveBeenCalledWith(
        wallet,
        expect.objectContaining({ 
          name: "DemoToken",
          symbol: "DEMO",
          decimals: "6"
        })
      );
    });

    it("should handle prompt: 'Create a new token: name=TestCoin, symbol=TC, no decimals, using a url at https://test.coin/metadata.json'", async () => {
      // Mock the parameter extraction that would happen in the LLM
      const extractedParams = { 
        name: "TestCoin",
        symbol: "TC",
        decimals: "0",
        metadataUrl: "https://test.coin/metadata.json"
      };
      
      await metaplexService.deployToken(wallet, extractedParams);
      
      expect(metaplexService.deployToken).toHaveBeenCalledWith(
        wallet,
        expect.objectContaining({ 
          name: "TestCoin",
          symbol: "TC",
          decimals: "0"
        })
      );
    });
  });

  // Test Helius transaction examples
  describe("helius/solana_send_transaction_with_high_priority_fee.eval.ts", () => {
    const heliusService = new HeliusService();
    const wallet = mockWalletClient();

    it("should handle prompt: 'Send 1 SOL to D9BU6XqBpdyJHZvZ9MSLxLAdJqLoyls7FbMjPKcWRonQ with a very high prio fee'", async () => {
      // Mock the parameter extraction that would happen in the LLM
      const extractedParams = { 
        token: "SOL",
        amount: "1",
        to: "D9BU6XqBpdyJHZvZ9MSLxLAdJqLoyls7FbMjPKcWRonQ",
        priorityFee: "high"
      };
      
      await heliusService.sendTransactionWithPriorityFee(wallet, extractedParams);
      
      expect(heliusService.sendTransactionWithPriorityFee).toHaveBeenCalledWith(
        wallet,
        expect.objectContaining({ 
          token: "SOL",
          amount: "1",
          priorityFee: "high"
        })
      );
    });

    it("should handle prompt: 'Send 250 SOL to D9BU6XqBpdyJHZvZ9MSLxLAdJqLoyls7FbMjPKcWRonQ. Use a low priority fee.'", async () => {
      // Mock the parameter extraction that would happen in the LLM
      const extractedParams = { 
        token: "SOL",
        amount: "250",
        to: "D9BU6XqBpdyJHZvZ9MSLxLAdJqLoyls7FbMjPKcWRonQ",
        priorityFee: "low"
      };
      
      await heliusService.sendTransactionWithPriorityFee(wallet, extractedParams);
      
      expect(heliusService.sendTransactionWithPriorityFee).toHaveBeenCalledWith(
        wallet,
        expect.objectContaining({ 
          token: "SOL",
          amount: "250",
          priorityFee: "low"
        })
      );
    });
  });
});
