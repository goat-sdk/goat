import { describe, expect, it } from "vitest";
import { SwapChanService } from "../../dist/index.js"; // decorator metadata is emitted by the tsup build

const ADDRESS = "0xeb0eC7a28E4B6B175806E21D9D3afE45792C5c7B";
const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const NATIVE = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

function fakeWallet() {
    const sent: { to: string; data?: string; value?: bigint }[] = [];
    const wallet = {
        getChain: () => ({ type: "evm", id: 8453 }),
        getAddress: () => ADDRESS,
        sendTransaction: async (tx: { to: string; data?: string; value?: bigint }) => {
            sent.push(tx);
            return { hash: `0x${"ab".repeat(32)}` };
        },
    };
    return { wallet: wallet as never, sent };
}

// Hits the live public API at api.swapchan.com.
describe("SwapChanService", () => {
    const service = new SwapChanService();

    it("returns ranked quotes", async () => {
        const { wallet } = fakeWallet();
        const r = await service.getQuote(wallet, {
            fromToken: NATIVE,
            toToken: USDC_BASE,
            amount: "1000000000000000",
        } as never);
        expect(r.quotes.length).toBeGreaterThan(0);
        expect(r.best).toBe(r.quotes[0].id);
    }, 30_000);

    it("quotes cross-chain to Solana", async () => {
        const { wallet } = fakeWallet();
        const r = await service.getQuote(wallet, {
            toChainId: 792703809,
            fromToken: USDC_BASE,
            toToken: "11111111111111111111111111111111",
            amount: "20000000",
            toAddress: "BUqwuxGmshL5aT9eW79D4c8kVdwCjcZLXjiotAntwFJE",
        } as never);
        expect(r.quotes.length).toBeGreaterThan(0);
    }, 30_000);

    it("sends the built swap tx through the wallet", async () => {
        const { wallet, sent } = fakeWallet();
        const r = await service.swap(wallet, {
            fromToken: NATIVE,
            toToken: USDC_BASE,
            amount: "1000000000000000",
        } as never);
        expect(r.hash).toMatch(/^0x/);
        const swapTx = sent[sent.length - 1];
        expect(swapTx.to).toMatch(/^0x[0-9a-fA-F]{40}$/);
        expect(swapTx.data?.length).toBeGreaterThan(10);
        expect(swapTx.value).toBe(1000000000000000n);
    }, 60_000);
});
