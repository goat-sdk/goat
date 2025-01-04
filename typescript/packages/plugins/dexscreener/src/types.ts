/**
 * Response type for Dexscreener API pair endpoints
 */
export interface DexscreenerPairResponse {
    pairs: Array<{
        chainId: string;
        dexId: string;
        pairAddress: string;
        baseToken: {
            address: string;
            name: string;
            symbol: string;
        };
        quoteToken: {
            address: string;
            name: string;
            symbol: string;
        };
        priceUsd: string;
        priceNative: string;
        txns: {
            h1: { buys: number; sells: number };
            h24: { buys: number; sells: number };
        };
        volume: {
            h1: number;
            h24: number;
        };
        liquidity?: {
            usd: number;
        };
    }>;
}
