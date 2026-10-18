import { randomBytes } from "node:crypto";

/** USDC contracts Predge accepts, by EVM chain id. */
export const PREDGE_USDC_BY_CHAIN: Record<number, string> = {
    8453: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
};

export type X402Signer = {
    address: string;
    chainId: number;
    signTypedData: (data: {
        domain: Record<string, unknown>;
        types: Record<string, unknown>;
        primaryType: string;
        message: Record<string, unknown>;
    }) => Promise<string>;
};

type PaymentRequirements = {
    scheme: string;
    network: string;
    asset: string;
    amount: string;
    payTo: string;
    maxTimeoutSeconds: number;
    extra?: { name?: string; version?: string };
};

type PaymentRequired = {
    x402Version: number;
    resource?: unknown;
    accepts: PaymentRequirements[];
};

const TRANSFER_WITH_AUTHORIZATION = [
    { name: "from", type: "address" },
    { name: "to", type: "address" },
    { name: "value", type: "uint256" },
    { name: "validAfter", type: "uint256" },
    { name: "validBefore", type: "uint256" },
    { name: "nonce", type: "bytes32" },
];

/**
 * Picks the payment option this signer can pay: x402 `exact` scheme, USDC on the signer's chain,
 * at or below the cap.
 */
export function selectRequirement(
    required: PaymentRequired,
    chainId: number,
    maxAtomic: bigint,
): PaymentRequirements | undefined {
    const usdc = PREDGE_USDC_BY_CHAIN[chainId];
    if (!usdc) return undefined;
    return required.accepts.find(
        (r) =>
            r.scheme === "exact" &&
            r.network === `eip155:${chainId}` &&
            r.asset.toLowerCase() === usdc.toLowerCase() &&
            BigInt(r.amount) <= maxAtomic &&
            r.extra?.name != null &&
            r.extra?.version != null,
    );
}

/**
 * Decodes the x402 v2 `payment-required` header (base64 JSON).
 */
export function decodePaymentRequired(header: string | null): PaymentRequired | undefined {
    if (!header) return undefined;
    try {
        const parsed = JSON.parse(Buffer.from(header, "base64").toString("utf8"));
        return Array.isArray(parsed?.accepts) ? (parsed as PaymentRequired) : undefined;
    } catch {
        return undefined;
    }
}

/**
 * GET a URL; on HTTP 402, pay with an EIP-3009 USDC authorization (x402 v2 `exact` scheme) and retry once.
 * Never pays more than `maxAtomic` (USDC atomic units, 6 decimals).
 */
export async function fetchWithX402(
    url: string,
    signer: X402Signer,
    maxAtomic: bigint,
    fetchImpl: typeof fetch = fetch,
): Promise<{ response: Response; paid: boolean }> {
    const headers = { Accept: "application/json" };
    const first = await fetchImpl(url, { headers });
    if (first.status !== 402) return { response: first, paid: false };

    const required = decodePaymentRequired(first.headers.get("payment-required"));
    if (!required) throw new Error("402 response without a valid payment-required header");
    const req = selectRequirement(required, signer.chainId, maxAtomic);
    if (!req) {
        throw new Error(
            `No payment option in USDC on eip155:${signer.chainId} at or below ${maxAtomic} atomic units; nothing was paid`,
        );
    }

    const now = Math.floor(Date.now() / 1000);
    const authorization = {
        from: signer.address,
        to: req.payTo,
        value: req.amount,
        validAfter: String(now - 600),
        validBefore: String(now + req.maxTimeoutSeconds),
        nonce: `0x${randomBytes(32).toString("hex")}`,
    };
    const signature = await signer.signTypedData({
        domain: {
            name: req.extra?.name,
            version: req.extra?.version,
            chainId: signer.chainId,
            verifyingContract: req.asset,
        },
        types: { TransferWithAuthorization: TRANSFER_WITH_AUTHORIZATION },
        primaryType: "TransferWithAuthorization",
        message: {
            ...authorization,
            value: BigInt(authorization.value),
            validAfter: BigInt(authorization.validAfter),
            validBefore: BigInt(authorization.validBefore),
        },
    });
    const paymentPayload = {
        x402Version: required.x402Version,
        resource: required.resource,
        accepted: req,
        payload: { authorization, signature },
    };
    const paid = await fetchImpl(url, {
        headers: {
            ...headers,
            "PAYMENT-SIGNATURE": Buffer.from(JSON.stringify(paymentPayload), "utf8").toString("base64"),
        },
    });
    return { response: paid, paid: true };
}
