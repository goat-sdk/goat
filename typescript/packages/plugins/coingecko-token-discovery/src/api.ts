export class CoinGeckoTokenDiscoveryAPI {
    private readonly baseUrl: string;

    constructor(
        private readonly apiKey: string,
        private readonly usePro: boolean = false,
    ) {
        if (usePro) {
            this.baseUrl = "https://pro-api.coingecko.com/api/v3";
        } else {
            this.baseUrl = "https://api.coingecko.com/api/v3";
        }
    }

    async request(
        endpoint: string,
        params: Record<string, string | boolean | number | undefined> = {},
    ): Promise<unknown> {
        const url = new URL(`${this.baseUrl}/${endpoint}`);

        if (this.usePro) {
            url.searchParams.append("x_cg_pro_api_key", this.apiKey);
        } else {
            url.searchParams.append("x_cg_demo_api_key", this.apiKey);
        }

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
