import { vi } from "vitest";
import { Balance, Signature, WalletClientBase } from "../../classes/WalletClientBase";
import { SolanaChain } from "../../types/Chain";

// Mock wallet client
export class MockWalletClient extends WalletClientBase {
    getChain(): SolanaChain {
        return { type: "solana" };
    }

    getAddress() {
        return "0xmockaddress";
    }

    async signMessage(message: string): Promise<Signature> {
        return { signature: `mock-signature-for-${message}` };
    }

    async balanceOf(address: string): Promise<Balance> {
        return {
            decimals: 18,
            symbol: "MOCK",
            name: "Mock Token",
            value: "100.0",
            inBaseUnits: "100000000000000000000",
        };
    }

    getCoreTools() {
        return [];
    }
}

// Mock fetch response helper
export const mockFetchResponse = (response: unknown, status = 200, ok = true) => {
    const mockResponse = {
        ok,
        status,
        statusText: ok ? "OK" : "Error",
        json: () => Promise.resolve(response),
    } as Response;

    if (!ok) {
        vi.fn().mockRejectedValueOnce(new Error(`Error ${status}: ${JSON.stringify(response)}`));
    } else {
        vi.fn().mockResolvedValueOnce(mockResponse);
    }
    return vi.fn().mockResolvedValueOnce(mockResponse);
};

// Create execution spy
export const createToolExecutionSpy = () => vi.fn();
