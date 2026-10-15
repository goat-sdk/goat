import { createHash } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MIZAN_CAVEAT, MizanApi, classifyVerdict } from "./mizan.api";

const BUNDLE = new TextEncoder().encode("bundle-bytes");
const FULL = createHash("sha256").update(BUNDLE).digest("hex");

const registry = {
    registry_root: "root123",
    credentials: [
        {
            id: "v12-btc-trend-4h",
            alias: "BTC-TREND-4H",
            issuer: "MIZAN",
            dataset: "BTC 4h OHLC",
            verdict: "PASS",
            era: "guest v12",
            anchor: { sha256: FULL },
            disclosed_metrics: { sharpe: 1.34 },
            links: { bundle: "https://mizan.market/verify/files/a.bundle" },
        },
        {
            id: "bb-relative",
            alias: "BOOK DEMO",
            issuer: "MIZAN Studio",
            verdict: "PASS",
            sandbox: true,
            anchor: null,
            credential_hash: FULL.slice(0, 16),
            links: { bundle: "/api/blackbox-submission/x/bundle" },
        },
        {
            id: "legend-spy-buyhold",
            alias: "SPY buy and hold",
            issuer: "MIZAN",
            verdict: "FAIL — published anyway",
            anchor: { sha256: "ff".repeat(32) },
            links: { bundle: "https://mizan.market/verify/files/spy.bundle" },
        },
    ],
};

const mockFetch = vi.fn();
const json = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status });

function route(map: Record<string, () => Response>) {
    mockFetch.mockImplementation(async (input: string) => {
        const key = Object.keys(map).find((k) => String(input).endsWith(k));
        return key ? map[key]() : new Response("not found", { status: 404 });
    });
}

beforeEach(() => {
    mockFetch.mockReset();
    vi.stubGlobal("fetch", mockFetch);
});

describe("classifyVerdict", () => {
    it("keeps issued verdicts", () => {
        expect(classifyVerdict("PASS ✓")).toBe("PASS");
        expect(classifyVerdict("FAIL · SharpeTooLow")).toBe("FAIL");
        expect(classifyVerdict("NOT SIGNIFICANT")).toBe("NOT_SIGNIFICANT");
        expect(classifyVerdict("LABELS SEALED")).toBe("LEDGER_ENTRY");
    });
});

describe("MizanApi.verifyCredential", () => {
    it("returns PASS with a matching bundle hash, provenance, link and caveat", async () => {
        route({
            "/api/registry": () => json(registry),
            "/api/public/registry": () => json({ credentials: [{ id: "v12-btc-trend-4h", provenance: "BACKTEST" }] }),
            "/a.bundle": () => new Response(BUNDLE),
        });
        const r = await new MizanApi().verifyCredential({ credentialId: "v12-btc-trend-4h" });
        expect(r.verdict).toBe("PASS");
        expect(r.hashMatch).toBe(true);
        expect(r.provenance).toBe("BACKTEST");
        expect(r.link).toBe("https://studio.mizan.market/credential/v12-btc-trend-4h");
        expect(r.caveat).toBe(MIZAN_CAVEAT);
    });

    it("resolves relative bundle links and checks the published hash prefix", async () => {
        route({
            "/api/registry": () => json(registry),
            "/api/public/registry": () => json({ credentials: [] }),
            "/api/blackbox-submission/x/bundle": () => new Response(BUNDLE),
        });
        const r = await new MizanApi().verifyCredential({ credentialId: "bb-relative" });
        expect(r.found).toBe(true);
        if (!r.found) return;
        expect(r.hashCheck).toBe("prefix");
        expect(r.hashMatch).toBe(true);
        expect(r.sandbox).toBe(true);
    });

    it("downgrades to UNVERIFIED on a hash mismatch", async () => {
        route({
            "/api/registry": () => json(registry),
            "/api/public/registry": () => json({}),
            "/spy.bundle": () => new Response(BUNDLE),
        });
        const r = await new MizanApi().verifyCredential({ credentialId: "legend-spy-buyhold" });
        expect(r.verdict).toBe("UNVERIFIED");
        expect(r.hashMatch).toBe(false);
    });

    it("returns UNVERIFIED for an unknown id and throws without input", async () => {
        route({ "/api/registry": () => json(registry) });
        const api = new MizanApi();
        const r = await api.verifyCredential({ credentialId: "nope" });
        expect(r.found).toBe(false);
        expect(r.verdict).toBe("UNVERIFIED");
        await expect(api.verifyCredential({})).rejects.toThrow(/credentialId or sha256/);
    });

    it("wraps registry HTTP errors", async () => {
        route({ "/api/registry": () => json({}, 503) });
        await expect(new MizanApi().verifyCredential({ credentialId: "x" })).rejects.toThrow(/503/);
    });
});

describe("MizanApi.searchCredentials", () => {
    it("filters by verdict, issuer and free text", async () => {
        route({ "/api/registry": () => json(registry) });
        const api = new MizanApi();
        expect((await api.searchCredentials({ verdict: "PASS" })).total).toBe(2);
        expect((await api.searchCredentials({ verdict: "FAIL" })).credentials[0].id).toBe("legend-spy-buyhold");
        expect((await api.searchCredentials({ issuer: "studio" })).total).toBe(1);
        expect((await api.searchCredentials({ query: "btc trend" })).total).toBe(1);
        expect((await api.searchCredentials({ limit: 1 })).credentials).toHaveLength(1);
    });
});

describe("MizanApi.listDatasets", () => {
    it("filters and trims datasets", async () => {
        route({
            "/api/blackbox-datasets": () =>
                json({
                    max_positions: 13000,
                    datasets: [
                        { key: "btc_4h", asset: "BTC", interval: "4h", bars: 12917, ppy: 2190 },
                        { key: "eth_1d", asset: "ETH", interval: "1d", bars: 2000 },
                    ],
                }),
        });
        const r = await new MizanApi().listDatasets({ asset: "btc" });
        expect(r.total).toBe(1);
        expect(r.datasets[0].key).toBe("btc_4h");
        expect(r.datasets[0].ppy).toBeUndefined();
        expect(r.maxPositions).toBe(13000);
    });
});

describe("MizanApi.checkAgent / listProvenAgents", () => {
    it("passes q and action and relays UNVERIFIED with the forward text", async () => {
        route({
            "/api/agents/check?q=0xabc123&action=pay": () =>
                json({
                    query: "0xabc123",
                    status: "UNVERIFIED",
                    found: false,
                    matches: [],
                    summary: "Its claimed performance is unproven, which is not the same as false.",
                    forward_to_counterparty: "You can prove your returns are real.",
                    caveat: "c",
                }),
        });
        const r = await new MizanApi().checkAgent({ agent: " 0xabc123 ", action: "pay" });
        expect(r.status).toBe("UNVERIFIED");
        expect(r.forward_to_counterparty).toBeTruthy();
        await expect(new MizanApi().checkAgent({ agent: " " })).rejects.toThrow(/agent to check/);
    });

    it("returns REFUSED matches and fills a missing caveat", async () => {
        route({
            "/api/agents/check?q=zkml12": () =>
                json({
                    query: "zkml12",
                    status: "REFUSED",
                    found: true,
                    matches: [{ id: "zkml12-a", verdict: "FAIL" }],
                    summary: "s",
                }),
        });
        const r = await new MizanApi().checkAgent({ agent: "zkml12" });
        expect(r.status).toBe("REFUSED");
        expect(r.matches[0].id).toBe("zkml12-a");
        expect(r.caveat).toBe(MIZAN_CAVEAT);
    });

    it("lists proven agents with default limit and real_only", async () => {
        route({
            "/api/agents/proven?limit=25&real_only=true": () =>
                json({
                    count: 1,
                    proven: [{ id: "v12-btc-trend-4h", verdict: "PASS" }],
                    disclosure: "minted by MIZAN itself",
                }),
        });
        const r = await new MizanApi().listProvenAgents({});
        expect(r.proven[0].id).toBe("v12-btc-trend-4h");
        expect(r.disclosure).toMatch(/MIZAN itself/);
        expect(r.caveat).toBe(MIZAN_CAVEAT);
    });
});
