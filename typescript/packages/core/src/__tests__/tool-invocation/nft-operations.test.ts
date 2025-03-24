import "reflect-metadata";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { Tool } from "../../decorators/Tool";
import { createToolParameters } from "../../utils/createToolParameters";
import { WalletClientBase } from "../../classes";
import { mockWalletClient } from "./mock-utils";

// Parameter classes for NFT operations
export class NftMintParams extends createToolParameters(
  z.object({
    name: z.string().describe("Name of the NFT"),
    description: z.string().describe("Description of the NFT"),
    image: z.string().describe("URL or IPFS hash of the NFT image"),
    recipient: z.string().optional().describe("Recipient address (defaults to wallet address)")
  })
) {
  static override schema = z.object({
    name: z.string().describe("Name of the NFT"),
    description: z.string().describe("Description of the NFT"),
    image: z.string().describe("URL or IPFS hash of the NFT image"),
    recipient: z.string().optional().describe("Recipient address (defaults to wallet address)")
  });
}

export class NftTransferParams extends createToolParameters(
  z.object({
    tokenId: z.string().describe("Token ID of the NFT"),
    contractAddress: z.string().describe("Contract address of the NFT"),
    to: z.string().describe("Recipient address")
  })
) {
  static override schema = z.object({
    tokenId: z.string().describe("Token ID of the NFT"),
    contractAddress: z.string().describe("Contract address of the NFT"),
    to: z.string().describe("Recipient address")
  });
}

// Service with NFT operation tools
class NftService {
  mintSpy = vi.fn().mockResolvedValue({ 
    txHash: "0xmockminthash", 
    tokenId: "123",
    contractAddress: "0xnftcontract",
    success: true 
  });
  
  transferSpy = vi.fn().mockResolvedValue({ 
    txHash: "0xmocktransferhash", 
    success: true 
  });

  @Tool({
    name: "mint_nft",
    description: "Mint a new NFT"
  })
  async mintNft(wallet: WalletClientBase, parameters: NftMintParams) {
    const { name, description, image, recipient } = parameters;
    const to = recipient || wallet.getAddress();
    return this.mintSpy(wallet, name, description, image, to);
  }

  @Tool({
    name: "transfer_nft",
    description: "Transfer an NFT to another address"
  })
  async transferNft(wallet: WalletClientBase, parameters: NftTransferParams) {
    const { tokenId, contractAddress, to } = parameters;
    return this.transferSpy(wallet, tokenId, contractAddress, to);
  }
}

describe("NFT Operations", () => {
  let service: NftService;
  let wallet: WalletClientBase;

  beforeEach(() => {
    service = new NftService();
    wallet = mockWalletClient();
  });

  describe("NFT Mint Tool", () => {
    it("should mint NFT to wallet address", async () => {
      const params = new NftMintParams();
      params.name = "Test NFT";
      params.description = "A test NFT";
      params.image = "ipfs://QmTest";
      
      const result = await service.mintNft(wallet, params);
      
      expect(result).toEqual({ 
        txHash: "0xmockminthash", 
        tokenId: "123",
        contractAddress: "0xnftcontract",
        success: true 
      });
      expect(service.mintSpy).toHaveBeenCalledWith(
        wallet, 
        "Test NFT", 
        "A test NFT", 
        "ipfs://QmTest", 
        "0xmockaddress"
      );
    });

    it("should mint NFT to specified recipient", async () => {
      const params = new NftMintParams();
      params.name = "Test NFT";
      params.description = "A test NFT";
      params.image = "ipfs://QmTest";
      params.recipient = "0xrecipient";
      
      await service.mintNft(wallet, params);
      
      expect(service.mintSpy).toHaveBeenCalledWith(
        wallet, 
        "Test NFT", 
        "A test NFT", 
        "ipfs://QmTest", 
        "0xrecipient"
      );
    });
  });

  describe("NFT Transfer Tool", () => {
    it("should transfer NFT", async () => {
      const params = new NftTransferParams();
      params.tokenId = "123";
      params.contractAddress = "0xnftcontract";
      params.to = "0xrecipient";
      
      const result = await service.transferNft(wallet, params);
      
      expect(result).toEqual({ 
        txHash: "0xmocktransferhash", 
        success: true 
      });
      expect(service.transferSpy).toHaveBeenCalledWith(
        wallet, 
        "123", 
        "0xnftcontract", 
        "0xrecipient"
      );
    });
  });
});
