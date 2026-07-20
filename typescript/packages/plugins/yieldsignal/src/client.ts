import { CdpX402Client } from "@coinbase/cdp-sdk/x402";
import { wrapFetchWithPayment } from "@x402/fetch";

const YIELDSIGNAL_BASE_URL = "https://yieldsignal.vercel.app";

/**
 * Real-time, risk-weighted USDC/WETH lending APY across Aave, Compound,
 * Morpho, Moonwell, Euler and Fluid on Base — sold per-call via x402
 * ($0.01), REST + MCP. Every response is signed (EIP-712) by the
 * payment-receiving address, which also holds an ERC-8004 agent identity
 * (`/agent-card.json`) and periodically publishes EAS attestations of past
 * readings on Base mainnet (`/track-record`) — a public track record
 * independent of the server's uptime. See https://yieldsignal.vercel.app.
 *
 * Uses its own CDP wallet (CDP_API_KEY_ID/CDP_API_KEY_SECRET/CDP_WALLET_SECRET
 * env vars) via `CdpX402Client` rather than adapting the agent's native GOAT
 * `WalletClientBase` — x402 payment signing is asset/network-specific and
 * best handled by the same client already proven against this exact service.
 */
export async function fetchYieldSignal(asset: "USDC" | "WETH"): Promise<unknown> {
    const client = new CdpX402Client();
    const fetchWithPayment = wrapFetchWithPayment(fetch, client);
    const res = await fetchWithPayment(`${YIELDSIGNAL_BASE_URL}/signal/${asset.toLowerCase()}-base-yield`);
    if (!res.ok) {
        throw new Error(`YieldSignal request failed: ${res.status} ${await res.text()}`);
    }
    return res.json();
}
