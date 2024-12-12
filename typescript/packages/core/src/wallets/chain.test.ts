import { describe, expect, it } from "vitest";
import { type Chain, getChainToken } from "./chain";

describe("getChainToken", () => {
    it("returns correct token info for Solana chain", () => {
        const chain: Chain = { type: "solana" };
        const token = getChainToken(chain);

        expect(token).toEqual({
            symbol: "SOL",
            name: "Solana",
            decimals: 9,
        });
    });

    it("returns correct token info for Aptos chain", () => {
        const chain: Chain = { type: "aptos" };
        const token = getChainToken(chain);

        expect(token).toEqual({
            symbol: "APT",
            name: "Aptos Coin",
            decimals: 8,
        });
    });

    it("returns correct token info for Chromia chain", () => {
        const chain: Chain = { type: "chromia" };
        const token = getChainToken(chain);

        expect(token).toEqual({
            symbol: "CHR",
            name: "Chroma",
            decimals: 6,
        });
    });

    it("returns correct token info for EVM chain", () => {
        const chain: Chain = { type: "evm", id: 1 }; // Ethereum mainnet
        const token = getChainToken(chain);

        expect(token).toEqual({
            symbol: "ETH",
            name: "Ether",
            decimals: 18,
        });
    });

    it("throws error for EVM chain without ID", () => {
        const chain: Chain = { type: "evm" };
        expect(() => getChainToken(chain)).toThrow("Chain ID is required for EVM chains");
    });

    it("throws error for unsupported EVM chain ID", () => {
        const chain: Chain = { type: "evm", id: 912341342342349 };
        expect(() => getChainToken(chain)).toThrow("Unsupported EVM chain ID: 912341342342349");
    });
});
