import { type WalletClientBase } from "@goat-sdk/core";
import { describe, expect, it, vi } from "vitest";
import { SpendPreflightApi } from "./api";
import { spendpreflight } from "./spendpreflight.plugin";

const wallet = {
    signMessage: vi.fn(() => {
        throw new Error("Wallet signing must not be used");
    }),
} as unknown as WalletClientBase;
const check = { risk: "low", flags: [], data_as_of: "2026-10-09T00:00:00Z", disclaimer: "Informational" };
describe("SpendPreflight GOAT plugin", () => {
    it("registers two real GOAT tools without wallet access", () => {
        const plugin = spendpreflight();
        const tools = plugin.getTools(wallet);
        expect(tools.map((t) => t.name)).toEqual(["spendpreflight_check_payee", "spendpreflight_preflight_payment"]);
        expect(tools.every((t) => t.description.includes("Operated by SpendPreflight"))).toBe(true);
        expect(wallet.signMessage).not.toHaveBeenCalled();
    });
    it("encodes check inputs and validates the result through the GOAT execution interface", async () => {
        const request = vi.fn<typeof fetch>(async () => Response.json(check));
        const tools = spendpreflight({ fetch: request, trial: true }).getTools(wallet);
        expect(await tools[0].execute({ name: "Acme & Sons" })).toMatchObject({ risk: "low" });
        const url = new URL(String(request.mock.calls[0][0]));
        expect(url.hostname).toBe("api.spendpreflight.com");
        expect(url.searchParams.get("name")).toBe("Acme & Sons");
        expect(url.searchParams.get("trial")).toBe("1");
    });
    it("returns hold/block unchanged and sends spending rules/context only to the screening API", async () => {
        const request = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
            const body = JSON.parse(String(init?.body));
            expect(body.context.spent_today_usd).toBe(0.1);
            expect(body.rules.max_per_payment_usd).toBe(0.5);
            return Response.json({ decision: "hold", reasons: ["hold: test policy"], receipt: { id: "fixture" } });
        });
        const tools = spendpreflight({ fetch: request }).getTools(wallet);
        const result = await tools[1].execute({
            challenge: { x402Version: 2, accepts: [] },
            rules: { max_per_payment_usd: 0.5 },
            spent_today_usd: 0.1,
        });
        expect(result).toMatchObject({ decision: "hold" });
        expect(String(request.mock.calls[0][0])).toBe("https://api.spendpreflight.com/v1/preflight");
        expect(wallet.signMessage).not.toHaveBeenCalled();
    });
    it("rejects bad input before network I/O", async () => {
        const request = vi.fn(async () => Response.json(check));
        const api = new SpendPreflightApi({ fetch: request });
        await expect(api.checkPayee({})).rejects.toThrow();
        await expect(api.preflightPayment({})).rejects.toThrow();
        await expect(api.preflightPayment({ challenge: { large: "x".repeat(65536) } })).rejects.toThrow(/64 KB/);
        expect(request).not.toHaveBeenCalled();
    });
    it("fails without retries on payment-required or unavailable responses", async () => {
        for (const status of [402, 503]) {
            const request = vi.fn(async () => new Response("", { status }));
            await expect(new SpendPreflightApi({ fetch: request }).checkPayee({ name: "Acme" })).rejects.toThrow(
                /SpendPreflight/,
            );
            expect(request).toHaveBeenCalledTimes(1);
        }
    });
    it("rejects malformed decisions and refuses implicit paid mode", async () => {
        const api = new SpendPreflightApi({ fetch: async () => Response.json({ decision: "sure" }) });
        await expect(api.preflightPayment({ cart: { total_usd: 0.01 } })).rejects.toThrow();
        expect(() => new SpendPreflightApi({ trial: false })).toThrow(/injected/);
    });
});
