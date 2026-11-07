import { Tool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { RectaCompareRouteParameters, RectaCorridorParameters } from "./parameters";

export const RECTA_API_URL = "https://api.recta.build";

/** EVM chains a Recta route can start from, by chain id, with the network name Recta's API uses. */
export const RECTA_NETWORK_BY_CHAIN_ID: Readonly<Record<number, string>> = {
    1: "ethereum",
    10: "optimism",
    56: "bnb_chain",
    130: "unichain",
    137: "polygon",
    143: "monad",
    999: "hyperevm",
    5042: "arc",
    8453: "base",
    42161: "arbitrum",
    43114: "avalanche",
    57073: "ink",
    59144: "linea",
};

export type FeesPerGas = { maxFeePerGas: bigint; maxPriorityFeePerGas: bigint };

export class RectaService {
    constructor(private readonly estimateFeesPerGas: (chainId: number) => Promise<FeesPerGas>) {}

    @Tool({
        name: "recta_check_route_coverage",
        description:
            "Free and unsigned: does Recta cover a cross-chain stablecoin transfer from the wallet's current chain, and which routes (bridges) does it compare? Never reveals a route, quote or saving. Call it before recta_compare_bridge_route.",
    })
    async checkRouteCoverage(walletClient: EVMWalletClient, parameters: RectaCorridorParameters) {
        return this.get("fit", walletClient, parameters);
    }

    @Tool({
        name: "recta_get_route_saving_odds",
        description:
            "Free and unsigned: how often Recta's recorded decisions found a cheaper route than each bridge on a corridor from the wallet's current chain. A past frequency, not a quote or a promise.",
    })
    async getRouteSavingOdds(walletClient: EVMWalletClient, parameters: RectaCorridorParameters) {
        return this.get("saving-odds", walletClient, parameters);
    }

    @Tool({
        name: "recta_compare_bridge_route",
        description:
            "Before a cross-chain stablecoin transfer from the wallet's current chain: ask Recta whether it can prove a cheaper route than the one you would use (baselineProvider) at the same chain state. Free, unsigned, stored nowhere; it signs and sends nothing. Returns whether a saving was found, its lower bound in USDC and Recta's fee: exactly 5% of that saving, charged only if you then execute Recta's route. No saving means nothing is owed. Names no route; to get and execute one, sign a request with @recta/client or the @recta/mcp server. 3 calls a day per address.",
    })
    async compareBridgeRoute(walletClient: EVMWalletClient, parameters: RectaCompareRouteParameters) {
        const chainId = walletClient.getChain().id;
        const query = new URLSearchParams({
            source_network: sourceNetworkOf(chainId),
            source_asset: parameters.asset,
            destination_network: parameters.destinationNetwork,
            destination_asset: parameters.asset,
            amount: parameters.amount,
            baseline_provider: parameters.baselineProvider,
        });
        const template = await fetchJson(`/v1/golden-corridor/request-template?${query}`);
        if (template.covered !== true || typeof template.body !== "object" || template.body === null) {
            return { covered: false, answer: template };
        }

        const sender = walletClient.getAddress();
        const fees = await this.estimateFeesPerGas(chainId);
        const body = template.body as Record<string, unknown>;
        const request = {
            ...body,
            sender,
            recipient: parameters.recipient ?? sender,
            execution_authority: {
                ...(body.execution_authority as Record<string, unknown>),
                source_max_fee_per_gas_wei: fees.maxFeePerGas.toString(),
                source_max_priority_fee_per_gas_wei: fees.maxPriorityFeePerGas.toString(),
            },
        };
        return fetchJson("/v1/golden-corridor/trial-evaluation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(request),
        });
    }

    private async get(endpoint: "fit" | "saving-odds", walletClient: EVMWalletClient, parameters: RectaCorridorParameters) {
        const query = new URLSearchParams({
            source_network: sourceNetworkOf(walletClient.getChain().id),
            source_asset: parameters.asset,
            destination_network: parameters.destinationNetwork,
            destination_asset: parameters.asset,
        });
        return fetchJson(`/v1/golden-corridor/${endpoint}?${query}`);
    }
}

function sourceNetworkOf(chainId: number): string {
    const name = RECTA_NETWORK_BY_CHAIN_ID[chainId];
    if (name === undefined) throw new Error(`Recta routes cannot start on chain ${chainId}`);
    return name;
}

/** Calls Recta's API and parses its JSON answer, refusals included. */
async function fetchJson(path: string, init?: RequestInit): Promise<Record<string, unknown>> {
    const response = await fetch(`${RECTA_API_URL}${path}`, {
        ...init,
        headers: { Accept: "application/json", ...(init?.headers ?? {}) },
    });
    const text = await response.text();
    try {
        return JSON.parse(text) as Record<string, unknown>;
    } catch {
        throw new Error(`Recta answered HTTP ${response.status}: ${text.slice(0, 200)}`);
    }
}
