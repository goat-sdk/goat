import type { EVMWalletClient } from "@goat-sdk/wallet-evm";
import type { SolanaWalletClient } from "@goat-sdk/wallet-solana";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HelmswapApi, HelmswapApiError } from "./api";
import { HelmswapSolanaService } from "./helmswap-solana.service";
import { HelmswapPlugin, HelmswapSolanaPlugin } from "./helmswap.plugin";
import { HelmswapService } from "./helmswap.service";

const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const WALLET = "0x1111111111111111111111111111111111111111";
const SOL_WALLET = "7YttLkHDoNj9wyDur5pM1ejNaAvT9X4eqaYcHQqtj2G5";
const ticket = { v: 1, sig: "test" };

function jsonResponse(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

const evmQuote = {
    ok: true,
    quote: { netOutAmount: "1650000", minOutNet: "1641750", fee: { disclosed: true, feeAmount: "2500" } },
    priceImpact: { priceImpactPct: 0.01, buildable: true, level: "ok" },
    quoteTicket: ticket,
    warnings: [],
};

const asEvm = (w: unknown) => w as EVMWalletClient;
const asSolana = (w: unknown) => w as SolanaWalletClient;

function mockEvmWallet(chainId = 8453) {
    let n = 0;
    return {
        getAddress: () => WALLET,
        getChain: () => ({ type: "evm", id: chainId }),
        sendTransaction: vi.fn(async () => ({ hash: `0xhash${++n}` })),
    };
}

describe("HelmswapService (EVM)", () => {
    const fetchMock = vi.fn();
    beforeEach(() => {
        vi.stubGlobal("fetch", fetchMock);
    });
    afterEach(() => {
        fetchMock.mockReset();
        vi.unstubAllGlobals();
    });

    it("quotes on the wallet's chain and hides the quote ticket", async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse(evmQuote));
        const service = new HelmswapService(new HelmswapApi());
        const wallet = mockEvmWallet();
        const result = await service.getQuote(asEvm(wallet), {
            tokenIn: "ETH",
            tokenOut: USDC_BASE,
            amountIn: "1000000000000000",
        });

        const url = new URL(fetchMock.mock.calls[0][0]);
        expect(url.origin + url.pathname).toBe("https://helmswap.com/api/v1/quote");
        expect(url.searchParams.get("chainId")).toBe("8453");
        expect(url.searchParams.get("amountIn")).toBe("1000000000000000");
        expect(url.searchParams.has("slippageBps")).toBe(false);
        expect(result).not.toHaveProperty("quoteTicket");
        expect(result.quote.netOutAmount).toBe("1650000");
    });

    it("builds with the wallet as recipient, sends approvals first, then the swap", async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse(evmQuote)).mockResolvedValueOnce(
            jsonResponse({
                ok: true,
                dryRun: true,
                tx: { to: "0xrouter", data: "0xswap", value: "0", chainId: 8453 },
                approvals: [{ to: USDC_BASE, data: "0xapprove", value: "0" }],
                fee: { disclosed: true },
            }),
        );
        const service = new HelmswapService(new HelmswapApi());
        const wallet = mockEvmWallet();
        const result = await service.swap(asEvm(wallet), {
            tokenIn: USDC_BASE,
            tokenOut: "ETH",
            amountIn: "5000000",
            slippageBps: 100,
        });

        const [buildUrl, buildInit] = fetchMock.mock.calls[1];
        expect(buildUrl).toBe("https://helmswap.com/api/v1/build-tx");
        const body = JSON.parse(buildInit.body);
        expect(body).toMatchObject({
            chainId: 8453,
            tokenIn: USDC_BASE,
            tokenOut: "ETH",
            amountIn: "5000000",
            recipient: WALLET,
            quoteTicket: ticket,
            slippageBps: 100,
        });

        expect(wallet.sendTransaction).toHaveBeenNthCalledWith(1, { to: USDC_BASE, data: "0xapprove", value: 0n });
        expect(wallet.sendTransaction).toHaveBeenNthCalledWith(2, { to: "0xrouter", data: "0xswap", value: 0n });
        expect(result).toMatchObject({ hash: "0xhash2", approvalHashes: ["0xhash1"], minOut: "1641750" });
    });

    it("passes native value through as a bigint", async () => {
        const nativeBuild = {
            ok: true,
            tx: { to: "0xrouter", data: "0xswap", value: "1000000000000000" },
            approvals: [],
        };
        fetchMock.mockResolvedValueOnce(jsonResponse(evmQuote));
        fetchMock.mockResolvedValueOnce(jsonResponse(nativeBuild));
        const service = new HelmswapService(new HelmswapApi());
        const wallet = mockEvmWallet();
        await service.swap(asEvm(wallet), { tokenIn: "ETH", tokenOut: USDC_BASE, amountIn: "1000000000000000" });

        expect(wallet.sendTransaction).toHaveBeenCalledTimes(1);
        expect(wallet.sendTransaction).toHaveBeenCalledWith({
            to: "0xrouter",
            data: "0xswap",
            value: 1000000000000000n,
        });
    });

    it("does not build when price impact is not buildable", async () => {
        fetchMock.mockResolvedValueOnce(
            jsonResponse({ ...evmQuote, priceImpact: { priceImpactPct: 40, buildable: false, level: "block" } }),
        );
        const service = new HelmswapService(new HelmswapApi());
        const wallet = mockEvmWallet();
        await expect(
            service.swap(asEvm(wallet), { tokenIn: "ETH", tokenOut: USDC_BASE, amountIn: "1" }),
        ).rejects.toThrow(/price impact/);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(wallet.sendTransaction).not.toHaveBeenCalled();
    });

    it("surfaces API errors with status and code", async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse({ error: "Quote expired", code: "QUOTE_EXPIRED" }, 409));
        const api = new HelmswapApi();

        const error = await api.quote({ chainId: 8453 }).catch((e) => e);
        expect(error).toBeInstanceOf(HelmswapApiError);
        expect(error.status).toBe(409);
        expect(error.code).toBe("QUOTE_EXPIRED");
    });
});

describe("HelmswapSolanaService", () => {
    const fetchMock = vi.fn();
    beforeEach(() => {
        vi.stubGlobal("fetch", fetchMock);
    });
    afterEach(() => {
        fetchMock.mockReset();
        vi.unstubAllGlobals();
    });

    const solQuote = {
        ok: true,
        chain: "solana",
        quote: { netOutAmount: "688405", minNetOutAmount: "684962", fee: { disclosed: true } },
        quoteTicket: ticket,
    };

    function mockSolanaWallet() {
        return {
            getAddress: () => SOL_WALLET,
            sendRawTransaction: vi.fn(async () => ({ hash: "solsig" })),
        };
    }

    it("quotes without an API key", async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse(solQuote));
        const service = new HelmswapSolanaService(new HelmswapApi());
        const result = await service.getQuote(asSolana(mockSolanaWallet()), {
            inputMint: "So11111111111111111111111111111111111111112",
            outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
            amount: "10000000",
        });

        const url = new URL(fetchMock.mock.calls[0][0]);
        expect(url.searchParams.get("chain")).toBe("solana");
        expect(fetchMock.mock.calls[0][1].headers).not.toHaveProperty("X-Helm-Key");
        expect(result).not.toHaveProperty("quoteTicket");
    });

    it("requires an API key to build a swap", async () => {
        const service = new HelmswapSolanaService(new HelmswapApi());
        await expect(
            service.swap(asSolana(mockSolanaWallet()), { inputMint: "a", outputMint: "b", amount: "1" }),
        ).rejects.toThrow(/API key/);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("builds with the key and sends the unsigned transaction through the wallet", async () => {
        fetchMock
            .mockResolvedValueOnce(jsonResponse(solQuote))
            .mockResolvedValueOnce(jsonResponse({ ok: true, dryRun: true, tx: { transactionBase64: "AQID" } }));
        const service = new HelmswapSolanaService(new HelmswapApi(undefined, "test-key"));
        const wallet = mockSolanaWallet();
        const result = await service.swap(asSolana(wallet), {
            inputMint: "So11111111111111111111111111111111111111112",
            outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
            amount: "10000000",
        });

        const [, buildInit] = fetchMock.mock.calls[1];
        expect(buildInit.headers["X-Helm-Key"]).toBe("test-key");
        expect(JSON.parse(buildInit.body)).toMatchObject({ chain: "solana", user: SOL_WALLET, quoteTicket: ticket });
        expect(wallet.sendRawTransaction).toHaveBeenCalledWith("AQID");
        expect(result).toMatchObject({ hash: "solsig", minOut: "684962" });
    });
});

const ETH = { name: "Ether", symbol: "ETH", decimals: 18 };
const SOL = { name: "Solana", symbol: "SOL", decimals: 9 };

describe("plugins", () => {
    it("supports only buildable EVM chains", () => {
        const plugin = new HelmswapPlugin();
        expect(plugin.supportsChain({ type: "evm", id: 8453, nativeCurrency: ETH })).toBe(true);
        expect(plugin.supportsChain({ type: "evm", id: 42161, nativeCurrency: ETH })).toBe(false);
        expect(plugin.supportsChain({ type: "solana", nativeCurrency: SOL })).toBe(false);
    });

    it("supports Solana", () => {
        const plugin = new HelmswapSolanaPlugin();
        expect(plugin.supportsChain({ type: "solana", nativeCurrency: SOL })).toBe(true);
        expect(plugin.supportsChain({ type: "evm", id: 8453, nativeCurrency: ETH })).toBe(false);
    });

    it("exposes the expected tools", async () => {
        const evmTools = await new HelmswapPlugin().getTools(asEvm(mockEvmWallet()));
        expect(evmTools.map((t) => t.name).sort()).toEqual(["helmswap_get_quote", "helmswap_swap"]);
        const solTools = await new HelmswapSolanaPlugin().getTools(asSolana({}));
        expect(solTools.map((t) => t.name).sort()).toEqual(["helmswap_solana_get_quote", "helmswap_solana_swap"]);
    });
});
