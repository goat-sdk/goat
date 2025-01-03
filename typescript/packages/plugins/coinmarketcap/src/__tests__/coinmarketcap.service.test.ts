import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { describe, expect, it } from "vitest";
import { CoinmarketcapService } from "../coinmarketcap.service";

describe("CoinmarketcapService", () => {
    // Set NODE_ENV to test to use sandbox API
    process.env.NODE_ENV = "test";
    const API_KEY = "b54bcf4d-1bca-4e8e-9a24-22ff2c3d462c";
    const service = new CoinmarketcapService({ apiKey: API_KEY });
    const mockWalletClient = {} as EVMWalletClient;

    it("should fetch cryptocurrency listings", async () => {
        const result = await service.getCryptocurrencyListings(mockWalletClient, {
            start: 1,
            limit: 5,
            convert: "USD",
        });

        expect(result).toBeDefined();
        expect(result.data).toBeDefined();
        expect(result.status.error_code).toBe(0);
    });

    it("should fetch cryptocurrency quotes", async () => {
        const result = await service.getCryptocurrencyQuotes(mockWalletClient, {
            id: "1,2,3", // Bitcoin, Litecoin, Dogecoin
            convert: "USD",
        });

        expect(result).toBeDefined();
        expect(result.data).toBeDefined();
        expect(result.status.error_code).toBe(0);
    });

    it("should fetch exchange listings", async () => {
        const result = await service.getExchangeListings(mockWalletClient, {
            start: 1,
            limit: 5,
            convert: "USD",
        });

        expect(result).toBeDefined();
        expect(result.data).toBeDefined();
        expect(result.status.error_code).toBe(0);
    });

    it("should fetch exchange quotes", async () => {
        const result = await service.getExchangeQuotes(mockWalletClient, {
            id: "1,2,3", // Binance, Coinbase, Kraken
            convert: "USD",
        });

        expect(result).toBeDefined();
        expect(result.data).toBeDefined();
        expect(result.status.error_code).toBe(0);
    });

    it("should fetch latest content", async () => {
        const result = await service.getContent(mockWalletClient, {
            start: 1,
            limit: 5,
        });

        expect(result).toBeDefined();
        expect(result.data).toBeDefined();
        expect(result.status.error_code).toBe(0);
    });
});
