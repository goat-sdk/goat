import { Tool } from "@goat-sdk/core";
import { CheckTokenRugShieldParameters, ScanWalletRentParameters } from "./parameters";

const DEFAULT_ORIGIN = "https://rentandrugshield.com";
const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const SOLANA_PUBKEY_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export interface RentShieldOptions {
    apiUrl?: string;
    apiKey?: string;
}

export function isValidSolanaPublicKey(input: string): boolean {
    const trimmed = String(input || "").trim();
    if (!SOLANA_PUBKEY_RE.test(trimmed)) {
        return false;
    }
    const bytes: number[] = [0];
    for (let i = 0; i < trimmed.length; i += 1) {
        let carry = BASE58_ALPHABET.indexOf(trimmed[i]);
        if (carry < 0) {
            return false;
        }
        for (let j = 0; j < bytes.length; j += 1) {
            carry += bytes[j] * 58;
            bytes[j] = carry & 0xff;
            carry >>= 8;
        }
        while (carry > 0) {
            bytes.push(carry & 0xff);
            carry >>= 8;
        }
    }
    let leadingOnes = 0;
    while (leadingOnes < trimmed.length && trimmed[leadingOnes] === "1") {
        leadingOnes += 1;
    }
    return bytes.length + leadingOnes === 32;
}

function assertPublicAddress(value: string, label: string): string {
    const trimmed = String(value || "").trim();
    if (!isValidSolanaPublicKey(trimmed)) {
        throw new Error(
            `Invalid ${label}: expected a 32-byte base58 Solana public key. Never pass private keys or seed phrases.`,
        );
    }
    return trimmed;
}

type ReflectWithMetadata = typeof Reflect & {
    getMetadata?: (metadataKey: string, target: object, propertyKey: string | symbol) => unknown;
    defineMetadata?: (
        metadataKey: string,
        metadataValue: unknown,
        target: object,
        propertyKey: string | symbol,
    ) => void;
};

function ParamTypes(...types: unknown[]): MethodDecorator {
    return (target, propertyKey) => {
        const reflectMeta = Reflect as ReflectWithMetadata;
        if (reflectMeta.defineMetadata && !reflectMeta.getMetadata?.("design:paramtypes", target, propertyKey)) {
            reflectMeta.defineMetadata("design:paramtypes", types, target, propertyKey);
        }
    };
}

export class RentShieldService {
    private readonly explicitBaseUrl?: string;
    private readonly apiKey?: string;
    private cachedLiveBase: { url: string | null; expiresAt: number } = {
        url: null,
        expiresAt: 0,
    };

    constructor(options: RentShieldOptions = {}) {
        const rawUrl = (options.apiUrl || process.env.RENTSHIELD_API_URL || "").trim().replace(/\/+$/, "");
        this.explicitBaseUrl = rawUrl || undefined;
        this.apiKey = options.apiKey || process.env.RENTSHIELD_API_KEY || undefined;
    }

    private async resolveLiveBase(): Promise<string | null> {
        const now = Date.now();
        if (this.cachedLiveBase.url && this.cachedLiveBase.expiresAt > now) {
            return this.cachedLiveBase.url;
        }
        const response = await fetch(`${DEFAULT_ORIGIN}/live_endpoint.json`, {
            headers: { Accept: "application/json" },
        });
        if (!response.ok) {
            return null;
        }
        const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
        const candidate = String(payload.api_base || payload.endpoint || "")
            .trim()
            .replace(/\/+$/, "");
        if (!candidate) {
            return null;
        }
        const parsed = new URL(candidate);
        if (parsed.protocol !== "https:") {
            return null;
        }
        this.cachedLiveBase = { url: candidate, expiresAt: now + 5 * 60 * 1000 };
        return candidate;
    }

    private async requestJson(path: string, init: RequestInit): Promise<Record<string, unknown>> {
        const initialBase =
            this.explicitBaseUrl ||
            (this.cachedLiveBase.url && this.cachedLiveBase.expiresAt > Date.now()
                ? this.cachedLiveBase.url
                : DEFAULT_ORIGIN);

        const headers: Record<string, string> = {
            Accept: "application/json",
            ...((init.headers as Record<string, string>) || {}),
            ...(this.apiKey ? { "X-API-Key": this.apiKey } : {}),
        };

        let response = await fetch(`${initialBase}${path}`, { ...init, headers });
        if (!this.explicitBaseUrl && (response.status === 404 || response.status === 405)) {
            const liveBase = await this.resolveLiveBase();
            if (liveBase && liveBase !== initialBase) {
                response = await fetch(`${liveBase}${path}`, { ...init, headers });
            }
        }

        if (!response.ok) {
            throw new Error(`Rent & Rug Shield HTTP status ${response.status}`);
        }
        return (await response.json()) as Record<string, unknown>;
    }

    @Tool({
        name: "rentshield_check_token_rug",
        description:
            "Run a read-only 11-layer pre-buy rug and scam safety check on a Solana token mint (SPL, Token-2022, or pump.fun) via Rent & Rug Shield",
    })
    @ParamTypes(CheckTokenRugShieldParameters)
    async checkTokenRug(parameters: CheckTokenRugShieldParameters) {
        const cleanMint = assertPublicAddress(parameters.mint, "mint address");
        const data = await this.requestJson(`/api/v1/shield-check?mint=${encodeURIComponent(cleanMint)}`, {
            method: "GET",
            headers: { "X-Payment-Protocol": "x402" },
        });
        const rawScore = typeof data.score === "number" ? data.score : Number(data.safety_score);
        const score = Number.isFinite(rawScore) ? rawScore : null;
        return {
            mint: data.mint || cleanMint,
            symbol: data.symbol || null,
            name: data.name || null,
            tokenProgram: data.token_program || null,
            score,
            safeToBuy: Boolean(data.safe_to_buy ?? (score !== null && score >= 75 && !data.hidden_pda_rent_trap)),
            verdict: data.verdict || null,
            layersChecked: data.layers_checked ?? 11,
            layersPassed: data.layers_passed ?? null,
            checklistSummary: data.checklist_summary || null,
            checks: Array.isArray(data.checks) ? data.checks : [],
            reportUrl: `${DEFAULT_ORIGIN}/audit/${cleanMint}`,
        };
    }

    @Tool({
        name: "rentshield_scan_wallet_rent",
        description:
            "Read-only, non-custodial scan for reclaimable rent-exempt SOL locked in empty SPL and Token-2022 Associated Token Accounts (0% fee on first claim)",
    })
    @ParamTypes(ScanWalletRentParameters)
    async scanWalletRent(parameters: ScanWalletRentParameters) {
        const cleanWallet = assertPublicAddress(parameters.wallet, "wallet address");
        const data = await this.requestJson("/api/scan-wallet", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ wallet: cleanWallet, user_initiated: false }),
        });
        return {
            wallet: data.wallet || cleanWallet,
            isFirstFreeClaim: Boolean(data.is_first_free_claim),
            effectiveFeeBps: data.effective_fee_bps ?? data.fee_bps ?? 0,
            reclaimableCount: data.reclaimable_count ?? 0,
            emptyCount: data.empty_count ?? 0,
            dustCount: data.dust_count ?? 0,
            activeCount: data.active_count ?? 0,
            totalReclaimableSol: data.total_reclaimable_sol ?? 0,
            totalReclaimableLamports: data.total_reclaimable_lamports ?? 0,
            emptyReclaimable: Array.isArray(data.empty_reclaimable) ? data.empty_reclaimable : [],
            claimUrl: `${DEFAULT_ORIGIN}/?wallet=${cleanWallet}`,
        };
    }
}
