import { getTools } from "@goat-sdk/core";
import { beforeEach, describe, expect, it, vi } from "vitest";
// The @Tool decorator reads TypeScript decorator metadata, which vitest's transform does not emit, so these tests
// import the built package (the turbo `test` task depends on `build`).
import { caelaraShield } from "../../dist";

const mockFetch = vi.fn();

beforeEach(() => {
    mockFetch.mockReset();
    vi.stubGlobal("fetch", mockFetch);
});

const jsonResponse = (body: unknown, status = 200) =>
    ({
        ok: status < 400,
        status,
        statusText: status < 400 ? "OK" : "Error",
        json: () => Promise.resolve(body),
    }) as Response;

// A minimal wallet client: these tools do not use it, they only need the plugin to be listed.
const wallet = {
    getCoreTools: () => [],
    getChain: () => ({ type: "evm", id: 8453 }),
    getAddress: () => "0x3333333333333333333333333333333333333333",
    signMessage: async () => ({ signature: "0x" }),
    balanceOf: async () => ({}),
    // biome-ignore lint/suspicious/noExplicitAny: test double
} as any;

const route = {
    fromChain: "base",
    tokenIn: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
    tokenOut: "0x4200000000000000000000000000000000000006",
    amount: "10000000",
};

describe("caelara-shield plugin", () => {
    it("lists the two tools", async () => {
        const tools = await getTools({ wallet, plugins: [caelaraShield()] });
        expect(tools.map((t) => t.name)).toEqual(["caelara_shield_route_quote", "caelara_shield_safe_swap"]);
    });

    it("supports every chain", () => {
        expect(caelaraShield().supportsChain({ type: "solana" })).toBe(true);
        expect(caelaraShield().supportsChain({ type: "evm", id: 1 })).toBe(true);
    });

    it("posts a quote request to /v1/route/quote and returns the body", async () => {
        mockFetch.mockResolvedValueOnce(jsonResponse({ ok: true, provider: "velora", fee: { bps: 50 } }));
        const tools = await getTools({ wallet, plugins: [caelaraShield()] });
        const quote = tools.find((t) => t.name === "caelara_shield_route_quote");
        const result = await quote?.execute(route);

        expect(result).toEqual({ ok: true, provider: "velora", fee: { bps: 50 } });
        const [url, init] = mockFetch.mock.calls[0];
        expect(url).toBe("https://shield.caelaralabs.com/v1/route/quote");
        expect(init.method).toBe("POST");
        expect(JSON.parse(init.body)).toEqual(route);
    });

    it("posts a build request to /v1/route/build and passes the taker", async () => {
        mockFetch.mockResolvedValueOnce(jsonResponse({ ok: true, transactions: [{ type: "swap" }] }));
        const tools = await getTools({ wallet, plugins: [caelaraShield()] });
        const swap = tools.find((t) => t.name === "caelara_shield_safe_swap");
        await swap?.execute({ ...route, taker: "0x3333333333333333333333333333333333333333" });

        const [url, init] = mockFetch.mock.calls[0];
        expect(url).toBe("https://shield.caelaralabs.com/v1/route/build");
        expect(JSON.parse(init.body).taker).toBe("0x3333333333333333333333333333333333333333");
    });

    it("returns the service's error body instead of throwing on a 4xx", async () => {
        mockFetch.mockResolvedValueOnce(
            jsonResponse({ ok: false, error: "blocked_by_screening", message: "A token screened as high risk." }, 422),
        );
        const tools = await getTools({ wallet, plugins: [caelaraShield()] });
        const swap = tools.find((t) => t.name === "caelara_shield_safe_swap");
        const result = await swap?.execute({ ...route, taker: "0x3333333333333333333333333333333333333333" });
        expect(result).toMatchObject({ ok: false, error: "blocked_by_screening" });
    });

    it("declares a schema that rejects bad amounts, unknown chains and a missing taker", async () => {
        const tools = await getTools({ wallet, plugins: [caelaraShield()] });
        const quote = tools.find((t) => t.name === "caelara_shield_route_quote");
        const swap = tools.find((t) => t.name === "caelara_shield_safe_swap");
        const taker = "0x3333333333333333333333333333333333333333";

        expect(quote?.parameters.safeParse(route).success).toBe(true);
        expect(quote?.parameters.safeParse({ ...route, amount: "1.5" }).success).toBe(false);
        expect(quote?.parameters.safeParse({ ...route, amount: "0" }).success).toBe(false);
        expect(quote?.parameters.safeParse({ ...route, fromChain: "dogechain" }).success).toBe(false);
        expect(quote?.parameters.safeParse({ ...route, slippageBps: 9999 }).success).toBe(false);

        expect(swap?.parameters.safeParse({ ...route, taker }).success).toBe(true);
        expect(swap?.parameters.safeParse(route).success).toBe(false);
    });
});
