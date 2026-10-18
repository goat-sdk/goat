import { generateKeyPairSync, sign } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PredgeAPI } from "./predge.api";
import { canonicalJson, verifyBodySignature, verifyPredgeRecord } from "./verify";
import { fetchWithX402, selectRequirement } from "./x402";

const { privateKey, publicKey } = generateKeyPairSync("ed25519");
const TEST_KEY = (publicKey.export({ format: "der", type: "spki" }) as Buffer).subarray(-32).toString("hex");
const signHex = (m: string) => sign(null, Buffer.from(m, "utf8"), privateKey).toString("hex");
// biome-ignore lint/suspicious/noExplicitAny: test assertions on loosely typed results
type Json = Record<string, any>;
const BASE_USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

function signedRecord(overrides: Record<string, unknown> = {}) {
    const payload = {
        kind: "settlement-risk",
        risk_level: "caution",
        dispute_count: "1",
        q: 'Zürich "x"',
        ...overrides,
    };
    const canonical = canonicalJson(payload);
    const envelope: Record<string, unknown> = {
        version: "predge-attest-v1",
        public_key: TEST_KEY,
        canonical,
        signature: signHex(canonical),
        payload,
        kid: TEST_KEY.slice(0, 16),
    };
    envelope.envelope_signature = signHex(canonicalJson(envelope));
    return {
        market: { condition_id: "0xabc", market_id: "1", slug: "s", question: payload.q, closed: false },
        risk_level: payload.risk_level,
        uma_state: "disputed",
        open_dispute: true,
        block: { number: "1" },
        attestation: envelope,
    };
}

const res = (status: number, body: unknown, headers: Record<string, string> = {}) =>
    new Response(typeof body === "string" ? body : JSON.stringify(body), { status, headers });

const paymentRequired = (amount: string) =>
    Buffer.from(
        JSON.stringify({
            x402Version: 2,
            resource: { url: "https://api.predge.io/x" },
            accepts: [
                {
                    scheme: "exact",
                    network: "eip155:8453",
                    asset: BASE_USDC,
                    amount,
                    payTo: "0x9084f5000e07c7133d6da5ee4f271ab6d1821144",
                    maxTimeoutSeconds: 60,
                    extra: { name: "USD Coin", version: "2" },
                },
            ],
        }),
    ).toString("base64");

afterEach(() => vi.restoreAllMocks());

describe("verify", () => {
    it("canonicalizes like Predge", () => {
        expect(canonicalJson({ b: "é", a: [1, { d: null, c: true }] })).toBe('{"a":[1,{"c":true,"d":null}],"b":"é"}');
    });

    it("accepts a record signed by a trusted key and rejects tampering or untrusted keys", () => {
        expect(verifyPredgeRecord(signedRecord(), [TEST_KEY]).valid).toBe(true);
        expect(verifyPredgeRecord(signedRecord()).valid).toBe(false);
        const tampered = signedRecord();
        (tampered.attestation.payload as Record<string, unknown>).risk_level = "ok";
        expect(verifyPredgeRecord(tampered, [TEST_KEY]).valid).toBe(false);
    });

    it("verifies the detached body signature", () => {
        const body = JSON.stringify(signedRecord());
        const header = `kid=${TEST_KEY.slice(0, 16)}; alg=ed25519; sig=${signHex(`predge-body-v1\n${body}`)}`;
        expect(verifyBodySignature(body, header, [TEST_KEY])).toBe(true);
        expect(verifyBodySignature(`${body} `, header, [TEST_KEY])).toBe(false);
    });
});

describe("PredgeAPI", () => {
    const service = new PredgeAPI({ trustedKeys: [TEST_KEY] });

    it("returns a verified settlement-risk summary", async () => {
        const body = JSON.stringify(signedRecord());
        const header = `kid=${TEST_KEY.slice(0, 16)}; alg=ed25519; sig=${signHex(`predge-body-v1\n${body}`)}`;
        const fetchMock = vi
            .spyOn(globalThis, "fetch")
            .mockResolvedValue(res(200, body, { "x-predge-body-signature": header }));
        const result = (await service.getSettlementRisk("a/b")) as Json;
        expect(fetchMock.mock.calls[0][0]).toBe("https://api.predge.io/v1/settlement-risk/a%2Fb");
        expect(result.risk_level).toBe("caution");
        expect(result.signature.valid).toBe(true);
        expect(result.signature.bodySignature).toBe(true);
    });

    it("passes API errors through and never as 'no risk'", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue(res(404, { error: "unknown_market", message: "nope" }));
        const result = (await service.getSettlementRisk("x")) as Json;
        expect(result).toMatchObject({ error: true, status: 404, code: "unknown_market" });
    });

    it("verifies a record passed as a string", async () => {
        expect(service.verifyRecord(JSON.stringify(signedRecord())).valid).toBe(true);
        expect(service.verifyRecord("{").valid).toBe(false);
    });

    it("refuses paid tools when disabled or without an EVM wallet", async () => {
        const off = new PredgeAPI({ maxPaymentUsd: 0 });
        expect(await off.getWhaleTrades(undefined, 1)).toMatchObject({ error: true });
        expect(await service.getWhaleTrades(undefined, 1)).toMatchObject({
            message: "Paid Predge tools need an EVM wallet on Base",
        });
    });

    it("pays for the estimate with the wallet and verifies the record", async () => {
        const record = { ...signedRecord(), settlement_estimate: { p: "0.3" } };
        const fetchMock = vi
            .spyOn(globalThis, "fetch")
            .mockResolvedValueOnce(res(402, "{}", { "payment-required": paymentRequired("20000") }))
            .mockResolvedValueOnce(
                res(200, record, {
                    "payment-response": Buffer.from(JSON.stringify({ success: true })).toString("base64"),
                }),
            );
        const signer = {
            address: "0x1111111111111111111111111111111111111111",
            chainId: 8453,
            signTypedData: vi.fn().mockResolvedValue("0xsig"),
        };
        const result = (await service.getSettlementEstimate(signer, "1")) as Json;
        expect(result.settlement_estimate).toEqual({ p: "0.3" });
        expect(result.signature.valid).toBe(true);
        expect(result.payment).toEqual({ success: true });
        const typed = signer.signTypedData.mock.calls[0][0];
        expect(typed.primaryType).toBe("TransferWithAuthorization");
        expect(typed.domain).toMatchObject({
            name: "USD Coin",
            version: "2",
            chainId: 8453,
            verifyingContract: BASE_USDC,
        });
        expect(typed.message.value).toBe(20000n);
        const sent = JSON.parse(
            Buffer.from(
                (fetchMock.mock.calls[1][1] as { headers: Record<string, string> }).headers["PAYMENT-SIGNATURE"],
                "base64",
            ).toString(),
        );
        expect(sent.x402Version).toBe(2);
        expect(sent.accepted.amount).toBe("20000");
        expect(sent.payload.signature).toBe("0xsig");
        expect(sent.payload.authorization.to).toBe("0x9084f5000e07c7133d6da5ee4f271ab6d1821144");
    });
});

describe("x402", () => {
    it("does not pay above the cap or on another chain", async () => {
        const signer = { address: "0x1", chainId: 8453, signTypedData: vi.fn() };
        const fetchImpl = vi.fn().mockResolvedValue(res(402, "{}", { "payment-required": paymentRequired("60000") }));
        await expect(fetchWithX402("https://x", signer, 50000n, fetchImpl)).rejects.toThrow("nothing was paid");
        expect(signer.signTypedData).not.toHaveBeenCalled();
        const required = JSON.parse(Buffer.from(paymentRequired("1"), "base64").toString());
        expect(selectRequirement(required, 137, 50000n)).toBeUndefined();
        expect(selectRequirement(required, 8453, 50000n)?.amount).toBe("1");
    });

    it("returns non-402 responses without paying", async () => {
        const fetchImpl = vi.fn().mockResolvedValue(res(200, {}));
        const out = await fetchWithX402(
            "https://x",
            { address: "0x1", chainId: 8453, signTypedData: vi.fn() },
            1n,
            fetchImpl,
        );
        expect(out.paid).toBe(false);
    });
});
