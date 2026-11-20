export class CaelaraShieldApi {
    public readonly baseUrl: string;

    constructor(baseUrl = "https://shield.caelaralabs.com") {
        this.baseUrl = baseUrl;
    }

    /**
     * POSTs JSON to a Shield route. The service answers client errors with a JSON body of the form
     * { ok: false, error, message }; that body is returned as-is so the agent can read the reason.
     */
    async post(path: string, body: unknown) {
        const response = await fetch(`${this.baseUrl}${path}`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify(body),
        });

        let data: unknown;
        try {
            data = await response.json();
        } catch {
            throw new Error(`Caelara Shield request failed: ${response.status} ${response.statusText}`);
        }
        return data;
    }
}
