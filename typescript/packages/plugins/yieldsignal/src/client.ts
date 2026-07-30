import { CdpX402Client } from "@coinbase/cdp-sdk/x402";
import { wrapFetchWithPayment } from "@x402/fetch";

const YIELDSIGNAL_BASE_URL = "https://yieldsignal.vercel.app";

/** Assets the service sells a signal for. */
export const YIELD_SIGNAL_ASSETS = ["ETH_STAKING", "USDC", "WETH"] as const;
export type YieldSignalAsset = (typeof YIELD_SIGNAL_ASSETS)[number];

/**
 * Canonical path per asset. An EXPLICIT map, not a transformation of the asset
 * name: `${asset.toLowerCase()}-base-yield` happens to work for USDC/WETH and
 * produces a 404 for ETH liquid staking, which is neither on Base nor lending.
 * That exact shortcut shipped in a sibling plugin and made the strongest asset
 * unreachable, so it is spelled out here.
 */
const RESOURCE_PATHS: Record<YieldSignalAsset, string> = {
    ETH_STAKING: "/signal/eth-staking-yield",
    USDC: "/signal/usdc-base-yield",
    WETH: "/signal/weth-base-yield",
};

/**
 * Real-time, risk-weighted yield signal — ETH liquid staking (Lido, Rocket
 * Pool, Coinbase Wrapped Staked ETH, Frax Ether, Binance Staked ETH) on
 * Ethereum mainnet, plus USDC/WETH lending across Aave, Compound, Morpho,
 * Moonwell, Euler and Fluid on Base — sold per-call via x402 ($0.01), REST +
 * MCP. Every response is signed (EIP-712) by the payment-receiving address,
 * which also holds an ERC-8004 agent identity (`/agent-card.json`) and
 * periodically publishes EAS attestations of past readings on Base mainnet
 * (`/track-record`) — a public track record independent of the server's
 * uptime. Per-asset accuracy is free at `/accuracy.json`.
 * See https://yieldsignal.vercel.app.
 *
 * Uses its own CDP wallet (CDP_API_KEY_ID/CDP_API_KEY_SECRET/CDP_WALLET_SECRET
 * env vars) via `CdpX402Client` rather than adapting the agent's native GOAT
 * `WalletClientBase` — x402 payment signing is asset/network-specific and
 * best handled by the same client already proven against this exact service.
 */
export async function fetchYieldSignal(asset: YieldSignalAsset): Promise<unknown> {
    const client = new CdpX402Client();
    const fetchWithPayment = wrapFetchWithPayment(fetch, client);
    const res = await fetchWithPayment(`${YIELDSIGNAL_BASE_URL}${RESOURCE_PATHS[asset]}`);
    if (!res.ok) {
        throw new Error(`YieldSignal request failed: ${res.status} ${await res.text()}`);
    }
    return res.json();
}
