import type { SolanaNetwork, Token } from "../tokens";

export function getTokenInfoBySymbol(symbol: string, tokens: Token[], network: SolanaNetwork) {
    const token = tokens.find((token) => [token.symbol, token.symbol.toLowerCase()].includes(symbol));
    return {
        symbol: token?.symbol,
        mintAddress: token?.mintAddresses[network],
        decimals: token?.decimals,
        name: token?.name,
    };
}
