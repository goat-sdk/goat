export class CoinGeckoTokenDiscoveryAPI {
    private readonly baseUrl = "https://api.coingecko.com/api/v3";

    constructor(private readonly apiKey: string) {}

    async request(
        endpoint: string,
        params: Record<string, string | boolean | number | undefined> = {},
    ): Promise<unknown> {
        const url = new URL(`${this.baseUrl}/${endpoint}`);

        url.searchParams.append("x_cg_demo_api_key", this.apiKey);

        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined && value !== null) {
                url.searchParams.append(key, String(value));
            }
        }

        try {
            const response = await fetch(url.toString(), {
                headers: {
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`CoinGecko API Error: ${response.status} ${errorText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`CoinGecko API request failed: ${error}`);
            throw error;
        }
    }
}
