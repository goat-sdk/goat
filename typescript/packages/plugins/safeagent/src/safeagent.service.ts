import { Tool } from "@goat-sdk/core";

const API = "https://cryptogenesis.duckdns.org/token";

export class SafeAgentService {
    @Tool({
        name: "shield",
        description: "THE FIREWALL — Check any crypto action before executing. Returns GO or BLOCK. Runs safety check + real honeypot simulation via DEX swap. Without Shield, agent might lose everything.",
    })
    async shield(parameters: {
        token: string;
        action?: string;
        chain?: string;
    }): Promise<string> {
        const { token, action = "check", chain = "base" } = parameters;

        // Safety check
        const safety = await fetch(`${API}/scan?address=${token}&chain=${chain}`);
        const sd = await safety.json();
        const score = sd.safety_score ?? 0;

        // Honeypot sim
        const hp = await fetch(`${API}/honeypot?address=${token}&chain=${chain}`);
        const hd = await hp.json();

        let result = `🛡️ SHIELD — ${sd.token?.name || "?"} (${sd.token?.symbol || "?"})\n`;
        result += `Safety: ${score}/100 — ${sd.verdict}\n`;

        if (hd.simulated) {
            if (hd.honeypot) return result + `🚫 HONEYPOT — BLOCKED. Cannot sell.\n`;
            result += `✅ Sell OK — tax: ${hd.total_tax_pct}%\n`;
        }

        if (score >= 70) result += `DECISION: ✅ GO`;
        else if (score >= 40) result += `DECISION: ⚠️ CAUTION`;
        else result += `DECISION: ❌ BLOCKED`;

        return result;
    }
}
