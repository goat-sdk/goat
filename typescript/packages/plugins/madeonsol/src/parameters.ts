import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

export class KolFeedParameters extends createToolParameters(
    z.object({
        limit: z.number().int().min(1).max(100).optional().describe("Max trades to return (default 50)"),
        action: z.enum(["buy", "sell"]).optional().describe("Filter by trade side"),
        kol: z.string().optional().describe("Filter by a single KOL wallet address (base58)"),
    }),
) {}

export class KolCoordinationParameters extends createToolParameters(
    z.object({
        period: z.enum(["1h", "6h", "24h", "7d"]).optional().describe("Lookback window (default 24h)"),
        min_kols: z.number().int().min(2).max(50).optional().describe("Minimum distinct KOLs converging on a token (default 2)"),
        limit: z.number().int().min(1).max(50).optional().describe("Max results (default 20)"),
    }),
) {}

export class KolLeaderboardParameters extends createToolParameters(
    z.object({
        period: z.enum(["today", "7d", "30d"]).optional().describe("Ranking window (default 7d)"),
        limit: z.number().int().min(1).max(50).optional().describe("Max KOLs to return (default 20)"),
    }),
) {}

export class KolTrendingTokensParameters extends createToolParameters(
    z.object({
        period: z.enum(["5m", "15m", "30m", "1h", "2h", "4h", "12h"]).optional().describe("Trending window (default 1h)"),
        min_kols: z.number().int().min(1).max(20).optional().describe("Minimum participating KOLs (default 2)"),
        limit: z.number().int().min(1).max(50).optional().describe("Max tokens to return (default 20)"),
    }),
) {}

export class DeployerAlertsParameters extends createToolParameters(
    z.object({
        limit: z.number().int().min(1).max(100).optional().describe("Max alerts to return (default 50)"),
        offset: z.number().int().min(0).optional().describe("Pagination offset"),
    }),
) {}

export class DeployerProfileParameters extends createToolParameters(
    z.object({
        wallet: z.string().describe("Deployer wallet address (base58)"),
    }),
) {}

export class TokenIntelParameters extends createToolParameters(
    z.object({
        mint: z.string().describe("Token mint address (base58)"),
    }),
) {}

export class TokenBuyerQualityParameters extends createToolParameters(
    z.object({
        mint: z.string().describe("Token mint address (base58)"),
    }),
) {}

export class WalletStatsParameters extends createToolParameters(
    z.object({
        address: z.string().describe("Solana wallet address (base58)"),
    }),
) {}

export class AlphaLeaderboardParameters extends createToolParameters(
    z.object({
        limit: z.number().int().min(1).max(500).optional().describe("Max wallets to return (default 100)"),
    }),
) {}
