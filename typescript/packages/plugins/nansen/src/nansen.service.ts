import { Tool } from "@goat-sdk/core";
import {
    GetAddressDetailsParams,
    GetEntityDetailsParams,
    GetExchangeFlowsParams,
    GetNFTDetailsParams,
    GetSignalParams,
    GetSmartMoneyParams,
    GetTokenDetailsParams,
} from "./parameters";

export class NansenService {
    constructor(private readonly apiKey: string) {}

    private async fetchNansen(endpoint: string) {
        const response = await fetch(`https://api.nansen.ai/v1${endpoint}`, {
            headers: {
                accept: "application/json",
                "api-key": this.apiKey,
            },
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    @Tool({
        description: "Get details for a specific address from Nansen",
    })
    async getAddressDetails(parameters: GetAddressDetailsParams) {
        const { address } = parameters;
        return this.fetchNansen(`/address/${address}`);
    }

    @Tool({
        description: "Get transactions for a specific address from Nansen",
    })
    async getAddressTransactions(parameters: GetAddressDetailsParams) {
        const { address } = parameters;
        return this.fetchNansen(`/address/${address}/transactions`);
    }

    @Tool({
        description: "Get details for a specific token from Nansen",
    })
    async getTokenDetails(parameters: GetTokenDetailsParams) {
        const { address, chain } = parameters;
        return this.fetchNansen(`/token/${chain}/${address}`);
    }

    @Tool({
        description: "Get details for a specific NFT collection or token from Nansen",
    })
    async getNFTDetails(parameters: GetNFTDetailsParams) {
        const { address, chain, tokenId } = parameters;
        const endpoint = tokenId ? `/nft/${chain}/${address}/${tokenId}` : `/nft/${chain}/${address}`;
        return this.fetchNansen(endpoint);
    }

    @Tool({
        description: "Check if an address is considered 'smart money' by Nansen",
    })
    async getSmartMoneyStatus(parameters: GetSmartMoneyParams) {
        const { address, chain } = parameters;
        return this.fetchNansen(`/smart-money/${chain}/${address}`);
    }

    @Tool({
        description: "Get details for a specific entity from Nansen",
    })
    async getEntityDetails(parameters: GetEntityDetailsParams) {
        const { entityId } = parameters;
        return this.fetchNansen(`/entity/${entityId}`);
    }

    @Tool({
        description: "Get token flow data for a specific exchange",
    })
    async getExchangeFlows(parameters: GetExchangeFlowsParams) {
        const { exchange, token, timeframe } = parameters;
        const tokenParam = token ? `&token=${token}` : "";
        return this.fetchNansen(`/exchange/${exchange}/flows?timeframe=${timeframe}${tokenParam}`);
    }

    @Tool({
        description: "Get data for a specific Nansen signal",
    })
    async getSignal(parameters: GetSignalParams) {
        const { signalId, parameters: signalParams } = parameters;
        const queryParams = signalParams ? `?${new URLSearchParams(signalParams as Record<string, string>)}` : "";
        return this.fetchNansen(`/signal/${signalId}${queryParams}`);
    }
}
