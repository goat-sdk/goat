import { Tool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { ERC20_ABI } from "./abi/erc20";
import { TokenInfoParameters } from "./parameters";
import { KNOWN_TOKENS } from "./token";
import { CoinGeckoToken, TokenInfo } from "./types";

export class TokenInfoService {
    private readonly coingeckoBaseUrl: string;
    private readonly apiKey: string;

    constructor(apiKey: string) {
        this.coingeckoBaseUrl = "https://api.coingecko.com/api/v3/";
        this.apiKey = apiKey;
    }

    @Tool({
        name: "get_token_info",
        description: "Get token information for a given symbol",
    })
    async getTokenInfo(walletClient: EVMWalletClient, parameters: TokenInfoParameters): Promise<TokenInfo | null> {
        const chainId = walletClient.getChain().id;

        // First check known tokens
        const knownToken = KNOWN_TOKENS[parameters.symbol.toUpperCase() as keyof typeof KNOWN_TOKENS];
        if (knownToken) {
            const chainData = knownToken.chains[chainId.toString()];
            if (!chainData) {
                return null; // Token not available on current network
            }

            return {
                symbol: knownToken.symbol,
                name: knownToken.name,
                decimals: knownToken.decimals,
                contractAddress: chainData.contractAddress,
            };
        }

        // If not found, try CoinGecko
        try {
            const response = await fetch(`${this.coingeckoBaseUrl}coins/list?include_platform=true`, {
                method: "GET",
                headers: {
                    accept: "application/json",
                    "x-cg-demo-api-key": this.apiKey,
                },
            });
            const data: CoinGeckoToken[] = await response.json();

            const matches = data.filter((token) => token.symbol.toLowerCase() === parameters.symbol.toLowerCase());
            if (matches.length > 0) {
                console.log(
                    "Matching tokens:",
                    matches.map((token) => ({
                        name: token.name,
                        symbol: token.symbol,
                        platforms: token.platforms,
                    })),
                );
            }
            for (const token of matches) {
                const platformAddress = this.getPlatformAddressForChainId(token.platforms, chainId);

                if (platformAddress) {
                    const tokenDecimals = await walletClient.read({
                        address: platformAddress as `0x${string}`,
                        abi: ERC20_ABI,
                        functionName: "decimals",
                    });
                    const tokenDecimalsParsed = (tokenDecimals as { value: number }).value;
                    return {
                        symbol: token.symbol.toUpperCase(),
                        name: token.name,
                        contractAddress: platformAddress as `0x${string}`,
                        decimals: tokenDecimalsParsed,
                    };
                }
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    private getPlatformAddressForChainId(
        platforms: Record<string, string> | undefined,
        chainId: number,
    ): string | null {
        if (!platforms) return null;

        // Map chain IDs to CoinGecko platform identifiers
        const platformMap: Record<number, string> = {
            1: "ethereum",
            137: "polygon-pos",
            10: "optimistic-ethereum",
            42161: "arbitrum-one",
            8453: "base",
            34443: "mode",
            // Add more mappings as needed
        };
        const platformIdentifier = platformMap[chainId];
        if (!platformIdentifier) {
            return null;
        }
        if (platforms[platformIdentifier]) {
            return platforms[platformIdentifier];
        }
        return null;
    }
}
