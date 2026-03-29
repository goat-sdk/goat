export class ATVAPI {
    public static readonly DEFAULT_BASE_URL = "https://atv-api.aarna.ai";

    constructor(
        private readonly baseUrl: string,
        private readonly apiKey?: string,
    ) {}

    public async get<T = unknown>(endpoint: string, params: Record<string, string | undefined> = {}): Promise<T> {
        const url = new URL(`${this.baseUrl}${endpoint}`);
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined) {
                url.searchParams.append(key, value);
            }
        }

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };
        if (this.apiKey) {
            headers["x-api-key"] = this.apiKey;
        }

        const response = await fetch(url.toString(), { headers });

        if (!response.ok) {
            throw new Error(`ATV API error ${response.status} on GET ${endpoint}: ${await response.text()}`);
        }

        return response.json() as Promise<T>;
    }

    public async post<T = unknown>(endpoint: string, body: Record<string, unknown>): Promise<T> {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };
        if (this.apiKey) {
            headers["x-api-key"] = this.apiKey;
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: "POST",
            headers,
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(`ATV API error ${response.status} on POST ${endpoint}: ${await response.text()}`);
        }

        return response.json() as Promise<T>;
    }
}
