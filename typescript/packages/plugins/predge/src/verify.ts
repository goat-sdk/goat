import { createHash, createPublicKey, verify as edVerify } from "node:crypto";

/** Predge's published ed25519 attestation key (kid 13fa3d18a369e6c7). */
export const PREDGE_ATTESTATION_PUBLIC_KEY = "13fa3d18a369e6c71bf941563ba47822b30182273d5106a0e8fb61c5016352d9";

const ED25519_SPKI_PREFIX = "302a300506032b6570032100";
const BODY_SIGNATURE_PREFIX = "predge-body-v1\n";

export interface PredgeEnvelope {
    canonical: string;
    signature: string;
    public_key: string;
    payload?: unknown;
    kid?: string;
    content_hash?: string;
    envelope_signature?: string;
    [key: string]: unknown;
}

export interface PredgeVerification {
    valid: boolean;
    kid?: string;
    checks: {
        trustedKey: boolean;
        signature: boolean;
        payloadMatchesCanonical: boolean | null;
        contentHash: boolean | null;
        envelopeSignature: boolean | null;
    };
    error?: string;
}

/**
 * Canonical JSON as Predge signs it: keys sorted at every level, no whitespace,
 * strings as JSON.stringify writes them.
 *
 * @param value - Any JSON value
 * @returns The canonical string
 */
export function canonicalJson(value: unknown): string {
    if (value === null || typeof value !== "object") {
        return JSON.stringify(value);
    }
    if (Array.isArray(value)) {
        return `[${value.map((v) => canonicalJson(v)).join(",")}]`;
    }
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj)
        .filter((k) => obj[k] !== undefined)
        .sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(obj[k])}`).join(",")}}`;
}

/**
 * Verifies a raw ed25519 signature.
 *
 * @param message - The signed bytes
 * @param signatureHex - 64-byte signature as hex
 * @param publicKeyHex - 32-byte raw public key as hex
 * @returns True if the signature is valid
 */
export function verifyEd25519(message: Buffer | string, signatureHex: string, publicKeyHex: string): boolean {
    try {
        if (!/^[0-9a-f]{128}$/i.test(signatureHex) || !/^[0-9a-f]{64}$/i.test(publicKeyHex)) {
            return false;
        }
        const key = createPublicKey({
            key: Buffer.from(ED25519_SPKI_PREFIX + publicKeyHex, "hex"),
            format: "der",
            type: "spki",
        });
        const data = typeof message === "string" ? Buffer.from(message, "utf8") : message;
        return edVerify(null, data, key, Buffer.from(signatureHex, "hex"));
    } catch {
        return false;
    }
}

/**
 * Finds the signed envelope in a full API response, a bare envelope or an evidence pack.
 *
 * @param record - Parsed JSON
 * @returns The envelope, or undefined
 */
export function findEnvelope(record: unknown): PredgeEnvelope | undefined {
    if (!record || typeof record !== "object") return undefined;
    const r = record as Record<string, unknown>;
    if (typeof r.canonical === "string" && typeof r.signature === "string") {
        return r as PredgeEnvelope;
    }
    for (const key of ["attestation", "envelope", "record"]) {
        const found = findEnvelope(r[key]);
        if (found) return found;
    }
    return undefined;
}

/**
 * Verifies a Predge signed record against the pinned Predge key, never the key inside the record.
 *
 * @param record - A full API response, or the `attestation` envelope
 * @param trustedKeys - Trusted ed25519 public keys (hex). Defaults to Predge's published key.
 * @returns Verification result with each check
 */
export function verifyPredgeRecord(
    record: unknown,
    trustedKeys: string[] = [PREDGE_ATTESTATION_PUBLIC_KEY],
): PredgeVerification {
    const checks: PredgeVerification["checks"] = {
        trustedKey: false,
        signature: false,
        payloadMatchesCanonical: null,
        contentHash: null,
        envelopeSignature: null,
    };
    const env = findEnvelope(record);
    if (!env) {
        return { valid: false, checks, error: "No signed envelope (canonical + signature) found" };
    }
    const trusted = trustedKeys.map((k) => k.toLowerCase());
    const key = String(env.public_key ?? "").toLowerCase();
    checks.trustedKey = trusted.includes(key);
    // Verify with the trusted key only; a record signed by any other key fails.
    checks.signature = checks.trustedKey && verifyEd25519(env.canonical, env.signature, key);
    if (env.payload !== undefined) {
        checks.payloadMatchesCanonical = canonicalJson(env.payload) === env.canonical;
    }
    if (typeof env.content_hash === "string") {
        const hash = createHash("sha256").update(env.canonical, "utf8").digest("hex");
        checks.contentHash = hash === env.content_hash.toLowerCase();
    }
    if (typeof env.envelope_signature === "string") {
        const rest: Record<string, unknown> = { ...env };
        rest.envelope_signature = undefined; // canonicalJson drops undefined members
        checks.envelopeSignature = checks.trustedKey && verifyEd25519(canonicalJson(rest), env.envelope_signature, key);
    }
    const valid =
        checks.trustedKey &&
        checks.signature &&
        checks.payloadMatchesCanonical !== false &&
        checks.contentHash !== false &&
        checks.envelopeSignature !== false;
    return { valid, kid: env.kid ?? key.slice(0, 16), checks };
}

/**
 * Verifies the detached `x-predge-body-signature` header over the raw HTTP body.
 *
 * @param rawBody - Response body exactly as received
 * @param header - Value of the x-predge-body-signature header
 * @param trustedKeys - Trusted ed25519 public keys (hex)
 * @returns True if the body signature is valid under a trusted key
 */
export function verifyBodySignature(
    rawBody: string,
    header: string | null | undefined,
    trustedKeys: string[] = [PREDGE_ATTESTATION_PUBLIC_KEY],
): boolean {
    if (!header) return false;
    const parts = Object.fromEntries(
        header.split(";").map((p) => {
            const [k, ...v] = p.trim().split("=");
            return [k, v.join("=")];
        }),
    );
    if (parts.alg !== "ed25519" || !parts.kid || !parts.sig) return false;
    const key = trustedKeys.find((k) => k.toLowerCase().startsWith(parts.kid.toLowerCase()));
    if (!key) return false;
    return verifyEd25519(BODY_SIGNATURE_PREFIX + rawBody, parts.sig, key.toLowerCase());
}
