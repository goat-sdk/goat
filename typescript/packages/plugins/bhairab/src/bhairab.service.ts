import { Tool } from "@goat-sdk/core";
import { ScanTokenParameters } from "./parameters";

const BHAIRAB_ENDPOINT = "https://tao-gateway.fly.dev/v1/risk/scan";

export class BhairabService {
    constructor(private readonly apiKey?: string) {}

    @Tool({
        name: "bhairab_scan_token_risk",
        description:
            "Scan a Solana token for risk BEFORE trading it. Returns a verdict (proceed, caution, or stop) with cited reasons, from live market signals (liquidity, 24h move, volume, age) and on-chain authority checks — it catches freeze-authority honeypots (buy but can't sell) and mint-authority rug risk. Use this as a safety check before any buy or swap. Works without an API key (heuristic verdict); an API key unlocks an AI-reasoned verdict.",
    })
    async scanTokenRisk(parameters: ScanTokenParameters) {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (this.apiKey) {
            headers.Authorization = `Bearer ${this.apiKey}`;
        }

        const response = await fetch(BHAIRAB_ENDPOINT, {
            method: "POST",
            headers,
            body: JSON.stringify({
                chain: "solana",
                token: parameters.token,
                action: parameters.action ?? "buy",
                amountUsd: parameters.amountUsd,
            }),
        });

        if (!response.ok) {
            throw new Error(`Bhairab risk scan failed (HTTP ${response.status}): ${await response.text()}`);
        }

        return await response.json();
    }
}
