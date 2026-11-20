import { Tool } from "@goat-sdk/core";
import { CaelaraShieldApi } from "./api";
import { BuildSafeSwapParameters, GetRouteQuoteParameters } from "./parameters";

export class CaelaraShieldService {
    constructor(private readonly api: CaelaraShieldApi = new CaelaraShieldApi()) {}

    @Tool({
        name: "caelara_shield_route_quote",
        description:
            "Get a swap or bridge quote across Solana, Ethereum, Base, Arbitrum, Optimism, Polygon and BNB Chain. The quote includes a 0.50% integrator fee and a heuristic screen of both tokens. Nothing is signed or sent.",
    })
    async getRouteQuote(parameters: GetRouteQuoteParameters) {
        return this.api.post("/v1/route/quote", parameters);
    }

    @Tool({
        name: "caelara_shield_safe_swap",
        description:
            "Screen both tokens (heuristic) and build UNSIGNED swap or bridge transactions. Refuses high-risk or unscreened tokens unless overrideRisk is true. The returned transactions must be signed and sent by the user's own wallet; this tool never signs.",
    })
    async buildSafeSwap(parameters: BuildSafeSwapParameters) {
        return this.api.post("/v1/route/build", parameters);
    }
}
