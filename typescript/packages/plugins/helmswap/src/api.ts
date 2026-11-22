export const DEFAULT_HELMSWAP_BASE_URL = "https://helmswap.com";

/** EVM chain ids where HelmSwap can build swap transactions. */
export const HELMSWAP_EVM_CHAIN_IDS = [8453, 56, 1, 4663, 57073, 999, 99901, 5042];

export class HelmswapApiError extends Error {
    constructor(
        message: string,
        public readonly status: number,
        public readonly code?: string,
    ) {
        super(message);
        this.name = "HelmswapApiError";
    }
}

export type UnsignedEvmTx = {
    to: string;
    data: `0x${string}`;
    value?: string;
    chainId?: number;
};

export class HelmswapApi {
    constructor(
        private readonly baseUrl: string = DEFAULT_HELMSWAP_BASE_URL,
        private readonly apiKey?: string,
    ) {}

    get hasApiKey() {
        return Boolean(this.apiKey);
    }

    async quote(params: Record<string, string | number | undefined>) {
        const query = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined) query.set(key, String(value));
        }
        return this.request("GET", `/api/v1/quote?${query.toString()}`);
    }

    async buildTx(body: Record<string, unknown>) {
        return this.request("POST", "/api/v1/build-tx", body);
    }

    private async request(method: "GET" | "POST", path: string, body?: Record<string, unknown>) {
        const headers: Record<string, string> = { accept: "application/json" };
        if (body) headers["content-type"] = "application/json";
        if (this.apiKey) headers["X-Helm-Key"] = this.apiKey;

        const response = await fetch(`${this.baseUrl.replace(/\/$/, "")}${path}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });

        // biome-ignore lint/suspicious/noExplicitAny: API responses are passed through to the agent
        let json: any;
        try {
            json = await response.json();
        } catch {
            throw new HelmswapApiError(`HelmSwap returned a non-JSON response (${response.status})`, response.status);
        }

        if (!response.ok || json?.ok === false) {
            throw new HelmswapApiError(
                json?.error ?? `HelmSwap request failed (${response.status})`,
                response.status,
                json?.code,
            );
        }

        return json;
    }
}
