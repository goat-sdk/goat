export interface CoinGeckoToken {
    id: string;
    symbol: string;
    name: string;
    platforms?: Record<string, string>;
}

export interface TokenInfo {
    symbol: string;
    name: string;
    decimals?: number;
    contractAddress: `0x${string}`;
}
