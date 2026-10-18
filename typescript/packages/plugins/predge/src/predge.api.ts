import { PREDGE_ATTESTATION_PUBLIC_KEY, verifyBodySignature, verifyPredgeRecord } from "./verify";
import { type X402Signer, fetchWithX402 } from "./x402";

export type PredgePluginOptions = {
    /** Predge API base URL. Defaults to https://api.predge.io */
    baseUrl?: string;
    /** Maximum USD a paid tool may pay per call. Defaults to 0.05; 0 disables paid tools. */
    maxPaymentUsd?: number;
    /** Trusted ed25519 public keys (hex). Defaults to Predge's published attestation key. */
    trustedKeys?: string[];
};

type Json = Record<string, unknown>;

function parseJson(text: string): Json | null {
    try {
        const parsed = JSON.parse(text);
        return parsed && typeof parsed === "object" ? (parsed as Json) : null;
    } catch {
        return null;
    }
}

/** The fields of a settlement-risk record an agent needs to decide whether to act. */
export function summarizeSettlementRisk(record: Json): Json {
    const market = (record.market ?? {}) as Json;
    const block = (record.block ?? {}) as Json;
    const segment = (record.segment_dispute_rate ?? null) as Json | null;
    return {
        market: {
            condition_id: market.condition_id,
            market_id: market.market_id,
            slug: market.slug,
            question: market.question,
            closed: market.closed,
        },
        risk_level: record.risk_level,
        recommendation: record.recommendation,
        uma_state: record.uma_state,
        resolved_on_chain: record.resolved_on_chain,
        onchain_resolution: record.onchain_resolution,
        paused: record.paused,
        dispute_count: record.dispute_count,
        open_dispute: record.open_dispute,
        sent_to_uma_vote: record.sent_to_uma_vote,
        current_proposal: record.current_proposal,
        checked_at: record.checked_at,
        block: block.number,
        ...(segment
            ? { segment_dispute_rate: { segment: segment.segment, rate: segment.rate, ci95: segment.ci95 } }
            : {}),
        ...(record.settlement_estimate !== undefined ? { settlement_estimate: record.settlement_estimate } : {}),
    };
}

function apiError(status: number, data: Json | null, url: string) {
    return {
        error: true,
        status,
        code: data?.error,
        message: (data?.message as string | undefined) ?? `Predge API request failed with status ${status}`,
        note: "An error is not a 'no risk' answer.",
        url,
    };
}

export class PredgeAPI {
    private readonly baseUrl: string;
    private readonly maxPaymentUsd: number;
    private readonly trustedKeys: string[];

    constructor(options: PredgePluginOptions = {}) {
        this.baseUrl = (options.baseUrl ?? "https://api.predge.io").replace(/\/+$/, "");
        this.maxPaymentUsd = options.maxPaymentUsd ?? 0.05;
        this.trustedKeys = options.trustedKeys ?? [PREDGE_ATTESTATION_PUBLIC_KEY];
    }

    async getSettlementRisk(market: string) {
        const url = `${this.baseUrl}/v1/settlement-risk/${encodeURIComponent(market)}`;
        const response = await fetch(url, { headers: { Accept: "application/json" } });
        const text = await response.text();
        const data = parseJson(text);
        if (!response.ok || !data) return apiError(response.status, data, url);
        return {
            ...summarizeSettlementRisk(data),
            signature: {
                ...verifyPredgeRecord(data, this.trustedKeys),
                bodySignature: verifyBodySignature(
                    text,
                    response.headers.get("x-predge-body-signature"),
                    this.trustedKeys,
                ),
            },
            source: url,
        };
    }

    verifyRecord(record: string) {
        const parsed = parseJson(record);
        if (!parsed) return { valid: false, error: "Record is not valid JSON" };
        return verifyPredgeRecord(parsed, this.trustedKeys);
    }

    async getSettlementEstimate(signer: X402Signer | undefined, market: string) {
        const url = `${this.baseUrl}/v1/settlement-risk/${encodeURIComponent(market)}/estimate`;
        return this.paid(signer, url, (data) => ({
            ...summarizeSettlementRisk(data),
            signature: verifyPredgeRecord(data, this.trustedKeys),
        }));
    }

    async getWhaleTrades(signer: X402Signer | undefined, limit = 20) {
        return this.paid(signer, `${this.baseUrl}/v1/whales/latest?limit=${limit}`, (data) => data);
    }

    private async paid(signer: X402Signer | undefined, url: string, shape: (data: Json) => unknown) {
        if (this.maxPaymentUsd <= 0) {
            return { error: true, message: "Paid Predge tools are disabled (maxPaymentUsd is 0)" };
        }
        if (!signer) {
            return { error: true, message: "Paid Predge tools need an EVM wallet on Base" };
        }
        const { response } = await fetchWithX402(url, signer, BigInt(Math.floor(this.maxPaymentUsd * 1_000_000)));
        const data = parseJson(await response.text());
        if (!response.ok || !data) return apiError(response.status, data, url);
        const paymentHeader = response.headers.get("payment-response");
        let payment: unknown = null;
        if (paymentHeader) {
            payment = parseJson(Buffer.from(paymentHeader, "base64").toString("utf8")) ?? { raw: paymentHeader };
        }
        return { ...(shape(data) as object), payment, source: url };
    }
}
