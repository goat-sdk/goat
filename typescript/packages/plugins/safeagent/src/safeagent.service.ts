import { Tool } from "@goat-sdk/core";

export class SafeAgentService {
    @Tool({
        name: "check_token_safety",
        description: "Check if a token is safe before buying. Detects honeypots, rug pulls, 17 scam patterns. Returns score 0-100. Use this BEFORE any swap.",
    })
    async checkTokenSafety(parameters: {
        tokenAddress: string;
        chain?: string;
    }): Promise<string> {
        const chain = parameters.chain || "base";
        const response = await fetch(
            `https://cryptogenesis.duckdns.org/token/scan?address=${parameters.tokenAddress}&chain=${chain}`
        );
        const data = await response.json();

        const score = data.safety_score ?? 0;
        const verdict = data.verdict ?? "UNKNOWN";
        const flags = data.flags ?? [];
        const token = data.token ?? {};

        let result = `${token.name || "?"} (${token.symbol || "?"}): ${score}/100 — ${verdict}\n`;

        if (score < 40) result += "🚫 DO NOT BUY — likely scam\n";
        else if (score < 70) result += "⚠️ CAUTION — risks detected\n";
        else result += "✅ Safe to trade\n";

        if (flags.length > 0) result += `Risks: ${flags.join(", ")}\n`;

        return result;
    }
}
