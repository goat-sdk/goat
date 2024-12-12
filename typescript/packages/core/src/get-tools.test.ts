import { describe, expect, test } from "vitest";
import { sendETH } from "./core-plugins/send-eth";
import { getTools } from "./get-tools";
import type { Plugin } from "./plugins";
import type { EVMSmartWalletClient, EVMWalletClient } from "./wallets";

describe("getTools", () => {
    test("returns core tools for any wallet", async () => {
        const mockWallet = createMockWallet();

        const tools = await getTools({ wallet: mockWallet });

        expect(tools).toHaveLength(2);
        expect(tools[0].name).toBe("get_address");
        expect(tools[1].name).toBe("get_balance");
    });

    test("includes plugin tools that support the chain", async () => {
        const mockWallet = createMockWallet();

        const tools = await getTools({
            wallet: mockWallet,
            plugins: [sendETH()],
        });

        expect(tools).toHaveLength(3);
        expect(tools.map((t) => t.name)).toContain("send_eth");
    });

    test("replaces {{tool}} placeholder with custom word", async () => {
        const mockWallet = createMockWallet();

        const tools = await getTools({
            wallet: mockWallet,
            options: { wordForTool: "function" },
        });

        expect(tools[0].description).toContain("function");
        expect(tools[0].description).not.toContain("{{tool}}");
    });

    test("skips plugins that don't support the chain", async () => {
        const mockWallet = createMockWallet();

        const mockPlugin = {
            name: "mock-plugin",
            supportsChain: () => false,
            supportsSmartWallets: () => false,
            getTools: async () => [],
        } as Plugin<EVMWalletClient>;

        const tools = await getTools({
            wallet: mockWallet,
            plugins: [mockPlugin],
        });

        expect(tools).toHaveLength(2); // Only core tools
    });

    test("skips plugins that don't support smart wallets", async () => {
        const mockWallet = createMockSmartWallet();

        const mockPlugin = {
            name: "mock-plugin",
            supportsChain: () => false,
            supportsSmartWallets: () => false,
            getTools: async () => [],
        } as Plugin<EVMWalletClient>;

        const tools = await getTools({
            wallet: mockWallet,
            plugins: [mockPlugin],
        });

        expect(tools).toHaveLength(2); // Only core tools
    });
});

function createMockWallet() {
    return {
        getChain: () => ({ type: "evm", id: 1 }),
        getAddress: () => "0xMock-address",
        balanceOf: async () => ({
            value: 1000n,
            decimals: 18,
            symbol: "ETH",
            name: "Ether",
        }),
        sendTransaction: async () => ({
            hash: "tx-hash",
            status: "success",
        }),
        read: async () => ({ value: "result" }),
        resolveAddress: async () => "0xresolved-address",
        signTypedData: async () => ({ signature: "sig" }),
        signMessage: async () => ({ signature: "sig" }),
    } as EVMWalletClient;
}

function createMockSmartWallet() {
    return {
        getChain: () => ({ type: "evm", id: 1 }),
        getAddress: () => "0xMock-address",
        balanceOf: async () => ({
            value: 1000n,
            decimals: 18,
            symbol: "ETH",
            name: "Ether",
        }),
        sendTransaction: async () => ({
            hash: "tx-hash",
            status: "success",
        }),
        read: async () => ({ value: "result" }),
        resolveAddress: async () => "0xresolved-address",
        signTypedData: async () => ({ signature: "sig" }),
        signMessage: async () => ({ signature: "sig" }),
        sendBatchOfTransactions: async () => ({ hash: "tx-hash", status: "success" }),
    } as EVMSmartWalletClient;
}
