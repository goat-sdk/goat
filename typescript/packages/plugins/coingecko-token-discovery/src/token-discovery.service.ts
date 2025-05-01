import { Tool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallets-evm";
import { SolanaWalletClient } from "@goat-sdk/wallets-solana";
import { CoinGeckoTokenDiscoveryAPI } from "./api";
import { GetTokenInfoBySymbolParameters, GetTokenInfoByTickerParameters } from "./parameters";

interface EVMTokenInfo {
    symbol: string;
    contractAddress: string;
    decimals: number;
    name: string;
}

interface SolanaTokenInfo {
    symbol: string;
    mintAddress: string;
    decimals: number;
    name: string;
}

interface CoinGeckoCoin {
    id: string;
    symbol: string;
    name: string;
}

interface CoinGeckoSearchResult {
    coins: CoinGeckoCoin[];
}

interface CoinGeckoTokenDetails {
    id: string;
    symbol: string;
    name: string;
    platforms: Record<string, string>;
}

export class TokenDiscoveryService {
    constructor(protected api: CoinGeckoTokenDiscoveryAPI) {}

    @Tool({
        name: "get_token_info_by_ticker",
        description: "Get information about a token by its ticker symbol using CoinGecko data.",
    })
    async getTokenInfoByTicker(
        walletClient: EVMWalletClient,
        parameters: GetTokenInfoByTickerParameters,
    ): Promise<EVMTokenInfo> {
        const { ticker } = parameters as unknown as { ticker: string };

        try {
            const searchResult = (await this.api.request("search", { query: ticker })) as CoinGeckoSearchResult;

            if (!searchResult.coins || searchResult.coins.length === 0) {
                return walletClient.getTokenInfoByTicker(ticker);
            }

            const exactMatch = searchResult.coins.find((coin) => coin.symbol.toLowerCase() === ticker.toLowerCase());

            const bestMatch = exactMatch || searchResult.coins[0];

            const tokenDetails = (await this.api.request(`coins/${bestMatch.id}`, {
                localization: false,
                tickers: false,
                market_data: true,
                community_data: false,
                developer_data: false,
            })) as CoinGeckoTokenDetails;

            if (!tokenDetails || !tokenDetails.platforms) {
                return walletClient.getTokenInfoByTicker(ticker);
            }

            const chain = walletClient.getChain();
            const chainId = typeof chain.id === "number" ? chain.id : Number.parseInt(chain.id);

            const platformToChainId: Record<string, number> = {
                ethereum: 1,
                "polygon-pos": 137,
                "optimistic-ethereum": 10,
                "arbitrum-one": 42161,
                base: 8453,
            };

            let contractAddress = "";
            for (const [platform, address] of Object.entries(tokenDetails.platforms)) {
                if (platformToChainId[platform] === chainId && address) {
                    contractAddress = address;
                    break;
                }
            }

            if (!contractAddress) {
                return walletClient.getTokenInfoByTicker(ticker);
            }

            return {
                symbol: bestMatch.symbol.toUpperCase(),
                contractAddress,
                decimals: 18, // Default to 18 as most ERC20 tokens use this (ideally would verify)
                name: bestMatch.name,
            };
        } catch (error) {
            console.error(`Error fetching token info for ${ticker}: ${error}`);
            return walletClient.getTokenInfoByTicker(ticker);
        }
    }

    @Tool({
        name: "get_token_info_by_symbol",
        description: "Get information about a token by its symbol using CoinGecko data.",
    })
    async getTokenInfoBySymbol(
        walletClient: SolanaWalletClient,
        parameters: GetTokenInfoBySymbolParameters,
    ): Promise<SolanaTokenInfo> {
        const { symbol } = parameters as unknown as { symbol: string };

        try {
            const searchResult = (await this.api.request("search", { query: symbol })) as CoinGeckoSearchResult;

            if (!searchResult.coins || searchResult.coins.length === 0) {
                return walletClient.getTokenInfoBySymbol(symbol);
            }

            const exactMatch = searchResult.coins.find((coin) => coin.symbol.toLowerCase() === symbol.toLowerCase());

            const bestMatch = exactMatch || searchResult.coins[0];

            const tokenDetails = (await this.api.request(`coins/${bestMatch.id}`, {
                localization: false,
                tickers: false,
                market_data: true,
                community_data: false,
                developer_data: false,
            })) as CoinGeckoTokenDetails;

            if (!tokenDetails || !tokenDetails.platforms) {
                return walletClient.getTokenInfoBySymbol(symbol);
            }

            const mintAddress = tokenDetails.platforms.solana;

            if (!mintAddress) {
                return walletClient.getTokenInfoBySymbol(symbol);
            }

            return {
                symbol: bestMatch.symbol.toUpperCase(),
                mintAddress,
                decimals: 9, // Default to 9 for Solana tokens, would be better to get actual decimals
                name: bestMatch.name,
            };
        } catch (error) {
            console.error(`Error fetching token info for ${symbol}: ${error}`);
            return walletClient.getTokenInfoBySymbol(symbol);
        }
    }
}
