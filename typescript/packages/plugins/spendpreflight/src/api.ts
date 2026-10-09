import { type z } from "zod";
import { checkParameters, checkResult, preflightParameters, preflightResult } from "./parameters";

export interface SpendPreflightOptions {
    /** Inject an existing x402-paying fetch. This plugin never accesses wallet keys. */
    fetch?: typeof fetch;
    /** Use the shared three-per-IP daily free trial. Defaults to true without an injected fetch. */
    trial?: boolean;
    timeoutMs?: number;
}

export class SpendPreflightApi {
    private readonly request: typeof fetch;
    private readonly trial: boolean;
    private readonly timeoutMs: number;
    constructor(options: SpendPreflightOptions = {}) {
        this.trial = options.trial ?? !options.fetch;
        if (!this.trial && !options.fetch) throw new Error("Paid screening requires an injected x402-paying fetch");
        this.request = options.fetch ?? fetch;
        this.timeoutMs = options.timeoutMs ?? 8000;
        if (!Number.isInteger(this.timeoutMs) || this.timeoutMs < 1 || this.timeoutMs > 60000)
            throw new Error("timeoutMs must be between 1 and 60000");
    }

    private async call(url: URL, init: RequestInit = {}): Promise<unknown> {
        if (this.trial) url.searchParams.set("trial", "1");
        const response = await this.request(url.toString(), {
            ...init,
            redirect: "error",
            signal: AbortSignal.timeout(this.timeoutMs),
        });
        if (response.status === 402)
            throw new Error(
                "SpendPreflight requires payment: check $0.01 or preflight $0.02 in Base USDC. Inject your x402-paying fetch or wait for the daily trial reset. No merchant payment was attempted.",
            );
        if (!response.ok)
            throw new Error(`SpendPreflight unavailable (HTTP ${response.status}); do not proceed with payment`);
        return response.json();
    }

    async checkPayee(input: z.infer<typeof checkParameters>) {
        const parameters = checkParameters.parse(input);
        const url = new URL("https://api.spendpreflight.com/v1/check");
        for (const [key, value] of Object.entries(parameters)) if (value) url.searchParams.set(key, value);
        return checkResult.parse(await this.call(url));
    }

    async preflightPayment(input: z.infer<typeof preflightParameters>) {
        const { spent_today_usd, ...parameters } = preflightParameters.parse(input);
        const body = JSON.stringify({ ...parameters, context: { spent_today_usd } });
        if (new TextEncoder().encode(body).byteLength > 65536)
            throw new Error("Preflight input exceeds 64 KB; not sent");
        return preflightResult.parse(
            await this.call(new URL("https://api.spendpreflight.com/v1/preflight"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body,
            }),
        );
    }
}
