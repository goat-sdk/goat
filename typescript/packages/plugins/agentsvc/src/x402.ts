import type { EVMWalletClient } from "@goat-sdk/wallet-evm";

// Minimal x402 client: reads the 402 answer, signs an EIP-3009 USDC transfer authorization on the
// wallet's chain (no gas, no approval) and retries the request with the PAYMENT-SIGNATURE header.

type Accept = {
    scheme: string;
    network: string;
    amount: string;
    asset: string;
    payTo: string;
    maxTimeoutSeconds: number;
    extra?: { name?: string; version?: string };
};

const decode = (s: string) => JSON.parse(Buffer.from(s, "base64").toString("utf8"));
const encode = (o: unknown) => Buffer.from(JSON.stringify(o), "utf8").toString("base64");
const randomNonce = () => {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return `0x${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}` as `0x${string}`;
};

export async function paidPost(
    walletClient: EVMWalletClient,
    url: string,
    body: object,
    maxPaymentUsdc: number,
): Promise<{ result: unknown; payment: unknown }> {
    const init = { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
    const first = await fetch(url, init);
    if (first.status !== 402) return finish(first, null);

    const header = first.headers.get("payment-required");
    if (!header) throw new Error(`Expected a PAYMENT-REQUIRED header from ${url}`);
    const required = decode(header) as { resource: unknown; accepts: Accept[]; extensions?: unknown };
    const chainId = walletClient.getChain().id;
    const accept = required.accepts.find((a) => a.scheme === "exact" && a.network === `eip155:${chainId}`);
    if (!accept) {
        throw new Error(
            `agentsvc.io does not accept payment on chain ${chainId}. Use a wallet on Base, Polygon or Arbitrum.`,
        );
    }
    if (BigInt(accept.amount) > BigInt(Math.round(maxPaymentUsdc * 1_000_000))) {
        throw new Error(`Price ${Number(accept.amount) / 1e6} USDC is above the limit of ${maxPaymentUsdc} USDC`);
    }

    const from = walletClient.getAddress() as `0x${string}`;
    const authorization = {
        from,
        to: accept.payTo,
        value: accept.amount,
        validAfter: "0",
        validBefore: String(Math.floor(Date.now() / 1000) + accept.maxTimeoutSeconds),
        nonce: randomNonce(),
    };
    const { signature } = await walletClient.signTypedData({
        domain: {
            name: accept.extra?.name ?? "USD Coin",
            version: accept.extra?.version ?? "2",
            chainId,
            verifyingContract: accept.asset as `0x${string}`,
        },
        types: {
            TransferWithAuthorization: [
                { name: "from", type: "address" },
                { name: "to", type: "address" },
                { name: "value", type: "uint256" },
                { name: "validAfter", type: "uint256" },
                { name: "validBefore", type: "uint256" },
                { name: "nonce", type: "bytes32" },
            ],
        },
        primaryType: "TransferWithAuthorization",
        message: authorization,
    });

    const paymentSignature = encode({
        x402Version: 2,
        resource: required.resource,
        accepted: accept,
        payload: { signature, authorization },
        extensions: required.extensions,
    });
    const paid = await fetch(url, { ...init, headers: { ...init.headers, "PAYMENT-SIGNATURE": paymentSignature } });
    return finish(paid, paid.headers.get("payment-response"));
}

async function finish(response: Response, paymentHeader: string | null) {
    const payload = (await response.json().catch(() => null)) as {
        data?: unknown;
        error?: unknown;
        message?: string;
    } | null;
    if (!response.ok) {
        // agentsvc.io does not settle the payment when a call fails
        throw new Error(
            `agentsvc.io answered ${response.status}: ${payload?.message ?? JSON.stringify(payload?.error ?? payload)}. Not charged.`,
        );
    }
    let payment: unknown = null;
    if (paymentHeader) {
        try {
            payment = decode(paymentHeader);
        } catch {
            payment = paymentHeader;
        }
    }
    return { result: payload?.data ?? payload, payment };
}
