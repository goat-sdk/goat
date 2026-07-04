import type { EvmChain } from "@goat-sdk/core";
import { describe, expect, it } from "vitest";
import { BosonProtocolPlugin, bosonProtocolPlugin } from "../src";

const MCP_URL = "https://mcp.bosonprotocol.io/mcp";

const evm = (id: number, name = "Ether", symbol = "ETH"): EvmChain => ({
    type: "evm",
    id,
    nativeCurrency: { name, symbol, decimals: 18 },
});

describe("BosonProtocolPlugin", () => {
    it("instantiates via factory function", () => {
        const plugin = bosonProtocolPlugin({ url: MCP_URL });
        expect(plugin).toBeInstanceOf(BosonProtocolPlugin);
        expect(plugin.name).toBe("boson-protocol");
    });

    it("exposes at least one tool provider", () => {
        const plugin = bosonProtocolPlugin({ url: MCP_URL });
        expect(plugin.toolProviders.length).toBeGreaterThan(0);
    });

    it.each([
        ["Ethereum mainnet", 1],
        ["Optimism", 10],
        ["Polygon", 137],
        ["Base", 8453],
        ["Arbitrum", 42161],
        ["Polygon Amoy testnet", 80002],
        ["Base Sepolia testnet", 84532],
        ["Sepolia testnet", 11155111],
        ["Optimism Sepolia testnet", 11155420],
        ["Arbitrum Sepolia testnet", 421614],
    ])("supports %s (%i)", (_name, chainId) => {
        const plugin = bosonProtocolPlugin({ url: MCP_URL });
        expect(plugin.supportsChain(evm(chainId))).toBe(true);
    });

    it("does not support BNB Smart Chain (56)", () => {
        const plugin = bosonProtocolPlugin({ url: MCP_URL });
        expect(plugin.supportsChain(evm(56, "BNB", "BNB"))).toBe(false);
    });

    it("does not support non-EVM chains", () => {
        const plugin = bosonProtocolPlugin({ url: MCP_URL });
        const solana = { type: "solana", id: 0, nativeCurrency: { name: "SOL", symbol: "SOL", decimals: 9 } };
        // biome-ignore lint/suspicious/noExplicitAny: deliberately passing a non-EVM chain
        expect(plugin.supportsChain(solana as any)).toBe(false);
    });
});
