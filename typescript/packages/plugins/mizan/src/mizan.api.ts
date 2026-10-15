import type {
    CheckAgentParameters,
    ListDatasetsParameters,
    ListProvenAgentsParameters,
    SearchCredentialsParameters,
    VerifyCredentialParameters,
} from "./parameters";

export const MIZAN_STUDIO_URL = "https://studio.mizan.market";
export const MIZAN_CAVEAT =
    "A MIZAN credential is a seal on a past record, not a forecast. It proves the record was computed as claimed under committed costs and data; it does not predict future returns.";

export type MizanVerdict = "PASS" | "FAIL" | "NOT_SIGNIFICANT" | "SIGNIFICANT" | "LEDGER_ENTRY" | "UNVERIFIED";

export type MizanOptions = {
    /** Studio base URL. Defaults to https://studio.mizan.market */
    baseUrl?: string;
};

type RegistryCredential = {
    id: string;
    alias?: string;
    issuer?: string;
    dataset?: string;
    minted_utc?: string;
    verdict?: string;
    kind?: string | null;
    era?: string | null;
    engine_era?: string | null;
    engine_image_id?: string | null;
    sandbox?: boolean;
    credential_hash?: string;
    anchor?: { sha256?: string } | null;
    disclosed_metrics?: Record<string, number | null> | null;
    links?: Record<string, string | undefined> | null;
};

/** Row returned by /api/agents/check (matches) and /api/agents/proven (proven). */
export type MizanAgentMatch = {
    id: string;
    alias?: string;
    verdict?: string;
    verdict_raw?: string;
    kind?: string | null;
    issuer?: string;
    dataset?: string;
    minted_utc?: string;
    bitcoin_confirmed?: boolean;
    engine_era?: string | null;
    page?: string;
};

/** PROVEN, REFUSED, NOT_SIGNIFICANT or UNVERIFIED (unproven, which is not the same as false). */
export type MizanCheckAgentResult = {
    query: string;
    status: string;
    found: boolean;
    match?: string;
    matches: MizanAgentMatch[];
    summary: string;
    advice?: string;
    forward_to_counterparty?: string;
    how_to_prove?: Record<string, string>;
    caveat: string;
};

type Registry = { credentials: RegistryCredential[]; registry_root?: string };

/**
 * Classify a raw registry verdict. PASS / FAIL / NOT SIGNIFICANT / SIGNIFICANT are kept as issued;
 * anything else is a sealed statistic without a gate (LEDGER_ENTRY).
 */
export function classifyVerdict(verdict: string | undefined | null): MizanVerdict {
    const v = (verdict || "").trim().toUpperCase();
    for (const k of ["PASS", "NOT SIGNIFICANT", "SIGNIFICANT", "FAIL"]) {
        if (v.startsWith(k)) return k.replace(" ", "_") as MizanVerdict;
    }
    return "LEDGER_ENTRY";
}

async function sha256Hex(bytes: ArrayBuffer): Promise<string> {
    const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

/**
 * Plain HTTP client behind the MIZAN tools (kept decorator-free so it is unit-testable).
 */
export class MizanApi {
    private readonly baseUrl: string;

    constructor(options: MizanOptions = {}) {
        this.baseUrl = (options.baseUrl || MIZAN_STUDIO_URL).replace(/\/+$/, "");
    }

    private resolve(url: string | undefined | null) {
        if (!url) return undefined;
        return /^https?:\/\//i.test(url) ? url : `${this.baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
    }

    private async getJson<T>(path: string, action: string): Promise<T> {
        try {
            const response = await fetch(`${this.baseUrl}${path}`);
            if (!response.ok) {
                throw new Error(`HTTP status ${response.status}`);
            }
            return (await response.json()) as T;
        } catch (error) {
            throw new Error(`Failed to ${action}: ${error}`);
        }
    }

    private async provenance(id: string): Promise<string | undefined> {
        try {
            const pub = await this.getJson<{ credentials?: { id: string; provenance?: string }[] }>(
                "/api/public/registry",
                "read the public registry",
            );
            return (pub.credentials || []).find((c) => c.id === id)?.provenance;
        } catch {
            return undefined;
        }
    }

    async verifyCredential(parameters: VerifyCredentialParameters) {
        const id = (parameters.credentialId || "").trim();
        const sha = (parameters.sha256 || "").trim().toLowerCase();
        if (!id && !sha) {
            throw new Error("Provide credentialId or sha256");
        }
        const reg = await this.getJson<Registry>("/api/registry", "read the MIZAN registry");
        const c = (reg.credentials || []).find(
            (x) => (id && x.id === id) || (sha && (x.anchor?.sha256 || "").toLowerCase() === sha),
        );
        if (!c) {
            return {
                found: false,
                id: id || undefined,
                verdict: "UNVERIFIED" as MizanVerdict,
                hashMatch: null,
                reason: "no such credential in the public MIZAN registry",
                registryRoot: reg.registry_root,
                caveat: MIZAN_CAVEAT,
            };
        }
        const out = {
            found: true,
            id: c.id,
            alias: c.alias,
            issuer: c.issuer,
            verdict: classifyVerdict(c.verdict),
            verdictRaw: c.verdict,
            provenance: await this.provenance(c.id),
            kind: c.kind ?? null,
            era: c.era ?? c.engine_era ?? null,
            engineImageId: c.engine_image_id ?? null,
            dataset: c.dataset,
            mintedUtc: c.minted_utc,
            sandbox: c.sandbox === true ? true : undefined,
            disclosedMetrics: c.disclosed_metrics || undefined,
            hashMatch: null as boolean | null,
            hashCheck: "none" as "sha256" | "prefix" | "none",
            registrySha256: c.anchor?.sha256 || undefined,
            registryRoot: reg.registry_root,
            bundle: this.resolve(c.links?.bundle),
            link: `${this.baseUrl}/credential/${encodeURIComponent(c.id)}`,
            verifyOffline: "https://mizan.market/verify/",
            reason: undefined as string | undefined,
            caveat: MIZAN_CAVEAT,
        };
        const full = (c.anchor?.sha256 || "").toLowerCase();
        const prefix = (c.credential_hash || "").toLowerCase();
        if (!out.bundle || (!full && !prefix)) {
            out.reason = "registry publishes no bundle link or anchor hash for this credential";
            return out;
        }
        try {
            const b = await fetch(out.bundle);
            if (!b.ok) {
                out.reason = `bundle not fetchable: HTTP ${b.status}`;
                return out;
            }
            const hex = await sha256Hex(await b.arrayBuffer());
            out.hashCheck = full ? "sha256" : "prefix";
            out.hashMatch = full ? hex === full : hex.startsWith(prefix);
            if (!out.hashMatch) {
                out.verdict = "UNVERIFIED";
                out.reason = "bundle sha256 does not match the registry anchor";
            }
        } catch (error) {
            out.reason = `bundle not fetchable: ${error}`;
        }
        return out;
    }

    async searchCredentials(parameters: SearchCredentialsParameters) {
        const reg = await this.getJson<Registry>("/api/registry", "read the MIZAN registry");
        const has = (hay: string | undefined, needle?: string) =>
            !needle || (hay || "").toLowerCase().includes(needle.trim().toLowerCase());
        const terms = (parameters.query || "").toLowerCase().split(/\s+/).filter(Boolean);
        const hits = (reg.credentials || []).filter((c) => {
            if (parameters.verdict && classifyVerdict(c.verdict) !== parameters.verdict) return false;
            if (!has(c.alias, parameters.alias) || !has(c.issuer, parameters.issuer)) return false;
            const blob = [c.id, c.alias, c.dataset, c.issuer, c.verdict].join(" ").toLowerCase();
            return terms.every((t) => blob.includes(t));
        });
        const limit = parameters.limit ?? 20;
        return {
            total: hits.length,
            registryRoot: reg.registry_root,
            credentials: hits.slice(0, limit).map((c) => ({
                id: c.id,
                alias: c.alias,
                issuer: c.issuer,
                verdict: classifyVerdict(c.verdict),
                verdictRaw: c.verdict,
                era: c.era ?? c.engine_era ?? null,
                dataset: c.dataset,
                sandbox: c.sandbox === true ? true : undefined,
                disclosedMetrics: c.disclosed_metrics || undefined,
                link: `${this.baseUrl}/credential/${encodeURIComponent(c.id)}`,
            })),
            caveat: MIZAN_CAVEAT,
        };
    }

    async listDatasets(parameters: ListDatasetsParameters) {
        const d = await this.getJson<{ datasets: Record<string, unknown>[]; max_positions?: number }>(
            "/api/blackbox-datasets",
            "list MIZAN datasets",
        );
        const eq = (a: unknown, b?: string) => !b || String(a ?? "").toLowerCase() === b.trim().toLowerCase();
        const keep = ["key", "label", "bars", "interval", "venue", "first", "last", "sha256"];
        const all = (d.datasets || []).filter(
            (x) => eq(x.asset, parameters.asset) && eq(x.interval, parameters.interval),
        );
        return {
            total: all.length,
            datasets: all.slice(0, parameters.limit ?? 50).map((x) => Object.fromEntries(keep.map((k) => [k, x[k]]))),
            maxPositions: d.max_positions,
            csv: `${this.baseUrl}/api/catalog/{key}.csv`,
        };
    }

    async checkAgent(parameters: CheckAgentParameters): Promise<MizanCheckAgentResult> {
        const agent = (parameters.agent || "").trim();
        if (!agent) {
            throw new Error("Provide the agent to check");
        }
        const qs = new URLSearchParams({ q: agent });
        if (parameters.action?.trim()) qs.set("action", parameters.action.trim());
        const r = await this.getJson<MizanCheckAgentResult>(`/api/agents/check?${qs.toString()}`, "check the agent");
        return { ...r, matches: r.matches || [], caveat: r.caveat || MIZAN_CAVEAT };
    }

    async listProvenAgents(parameters: ListProvenAgentsParameters) {
        const limit = parameters.limit ?? 25;
        const realOnly = parameters.realOnly ?? true;
        const r = await this.getJson<{
            count: number;
            proven?: MizanAgentMatch[];
            disclosure?: string;
            caveat?: string;
        }>(`/api/agents/proven?limit=${limit}&real_only=${realOnly}`, "list proven agents");
        return { ...r, proven: r.proven || [], caveat: r.caveat || MIZAN_CAVEAT };
    }
}
