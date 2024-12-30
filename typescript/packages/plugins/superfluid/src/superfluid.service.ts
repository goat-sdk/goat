import { Tool } from "@goat-sdk/core";
import { GetTrendingCoinsParameters } from "./parameters";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";

export class SuperfluidService {
    constructor() {}

    @Tool({
        description: "Get the list of trending coins from CoinGecko",
    })
    async getTrendingCoins(parameters: GetTrendingCoinsParameters) {
        const response = await fetch(
            `https://api.coingecko.com/api/v3/search/trending?x_cg_demo_api_key=${this.apiKey}`,
        );
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    @Tool({
        description: "Get the ERC20 token info by its symbol, including the contract address, decimals, and name",
    })
    async getTokenInfoBySymbol(walletClient: EVMWalletClient, parameters: GetTokenInfoBySymbolParameters) {
        const token = this.tokens.find((token) =>
            [token.symbol, token.symbol.toLowerCase()].includes(parameters.symbol),
        );

        if (!token) {
            throw Error(`Token with symbol ${parameters.symbol} not found`);
        }

        const chain = walletClient.getChain();

        const contractAddress = token.chains[chain.id]?.contractAddress;

        if (!contractAddress) {
            throw Error(`Token with symbol ${parameters.symbol} not found on chain ${chain.id}`);
        }

        return {
            symbol: token?.symbol,
            contractAddress,
            decimals: token?.decimals,
            name: token?.name,
        };
    }
}
