import { Tool } from "@goat-sdk/core";
import {
    AlphaLeaderboardParameters,
    DeployerAlertsParameters,
    DeployerProfileParameters,
    KolCoordinationParameters,
    KolFeedParameters,
    KolLeaderboardParameters,
    KolTrendingTokensParameters,
    TokenBuyerQualityParameters,
    TokenIntelParameters,
    WalletStatsParameters,
} from "./parameters";

export class MadeOnSolService {
    private readonly baseUrl = "https://madeonsol.com/api/v1";

    constructor(private readonly apiKey: string) {}

    private async get(path: string, params: Record<string, unknown> = {}, action = "fetch data") {
        const pairs: string[] = [];
        for (const key of Object.keys(params)) {
            const value = params[key];
            if (value === undefined || value === null) continue;
            pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
        }
        const qs = pairs.join("&");
        const url = `${this.baseUrl}${path}${qs ? `?${qs}` : ""}`;
        try {
            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${this.apiKey}` },
            });
            if (!response.ok) {
                const body = await response.text().catch(() => "");
                throw new Error(`HTTP ${response.status}${body ? `: ${body.slice(0, 200)}` : ""}`);
            }
            return await response.json();
        } catch (error) {
            throw new Error(`Failed to ${action}: ${error}`);
        }
    }

    @Tool({
        name: "madeonsol_kol_feed",
        description:
            "Real-time feed of every buy/sell from 1,000+ tracked Solana KOL (key opinion leader) wallets, with win rates, token age, and market cap at trade time. Sub-3s latency from on-chain confirmation.",
    })
    async kolFeed(parameters: KolFeedParameters) {
        return this.get("/kol/feed", { ...parameters }, "fetch KOL trade feed");
    }

    @Tool({
        name: "madeonsol_kol_coordination",
        description:
            "Detect tokens that multiple Solana KOLs are buying within the same window (coordination/convergence signal) — includes peak-density windows, exited count, and a 0-100 coordination score.",
    })
    async kolCoordination(parameters: KolCoordinationParameters) {
        return this.get("/kol/coordination", { ...parameters }, "fetch KOL coordination signals");
    }

    @Tool({
        name: "madeonsol_kol_leaderboard",
        description:
            "Ranked leaderboard of tracked Solana KOL wallets by PnL, win rate, and volume over a period (today, 7d, 30d).",
    })
    async kolLeaderboard(parameters: KolLeaderboardParameters) {
        return this.get("/kol/leaderboard", { ...parameters }, "fetch KOL leaderboard");
    }

    @Tool({
        name: "madeonsol_kol_trending_tokens",
        description:
            "Tokens ranked by raw KOL buy volume (SOL) within a short window — a pure 'where is KOL money flowing right now' signal with buy/sell volume, net flow, and participating KOL names.",
    })
    async kolTrendingTokens(parameters: KolTrendingTokensParameters) {
        return this.get("/kol/tokens/trending", { ...parameters }, "fetch KOL trending tokens");
    }

    @Tool({
        name: "madeonsol_deployer_alerts",
        description:
            "Recent pump.fun token launch alerts enriched with deployer reputation — tier (elite/good/rising), historical bonding rate, and rug history for the wallet that deployed each token.",
    })
    async deployerAlerts(parameters: DeployerAlertsParameters) {
        return this.get("/deployer-hunter/alerts", { ...parameters }, "fetch deployer alerts");
    }

    @Tool({
        name: "madeonsol_deployer_profile",
        description:
            "Full reputation profile for a pump.fun deployer wallet — tier, bonding rate, token outcome history. Returns is_deployer: false for wallets with no indexed deploys.",
    })
    async deployerProfile(parameters: DeployerProfileParameters) {
        return this.get(`/deployer-hunter/${encodeURIComponent(parameters.wallet)}`, {}, "fetch deployer profile");
    }

    @Tool({
        name: "madeonsol_token_intel",
        description:
            "One-call token intelligence for a Solana mint — VWAP price, market cap, safety flags, deployer reputation, KOL activity, and buyer-quality signals.",
    })
    async tokenIntel(parameters: TokenIntelParameters) {
        return this.get(`/token/${encodeURIComponent(parameters.mint)}`, {}, "fetch token intel");
    }

    @Tool({
        name: "madeonsol_token_buyer_quality",
        description:
            "Buyer-quality score (0-100) for a Solana token based on its earliest buyers — flags known alpha wallets, KOLs, and bundle buyers among the first purchasers. Useful as a pre-buy rug filter.",
    })
    async tokenBuyerQuality(parameters: TokenBuyerQualityParameters) {
        return this.get(`/tokens/${encodeURIComponent(parameters.mint)}/buyer-quality`, {}, "fetch buyer quality");
    }

    @Tool({
        name: "madeonsol_wallet_stats",
        description:
            "Aggregate 90-day trading stats for any Solana wallet — win rate, ROI, verdict (strong/profitable/neutral/losing), and cross-product flags (known KOL, alpha wallet, deployer). Requires PRO tier or higher.",
    })
    async walletStats(parameters: WalletStatsParameters) {
        return this.get(`/wallet/${encodeURIComponent(parameters.address)}`, {}, "fetch wallet stats");
    }

    @Tool({
        name: "madeonsol_alpha_leaderboard",
        description:
            "Leaderboard of 'alpha wallets' — non-KOL wallets that consistently appear among the first 20 buyers of pump.fun tokens that go on to succeed, scored from 1M+ early-buyer records.",
    })
    async alphaLeaderboard(parameters: AlphaLeaderboardParameters) {
        return this.get("/alpha/leaderboard", { ...parameters }, "fetch alpha leaderboard");
    }
}
