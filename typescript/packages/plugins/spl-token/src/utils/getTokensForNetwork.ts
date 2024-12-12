import type { NetworkSpecificToken, SolanaNetwork, Token } from "../tokens";

export function getTokensForNetwork(network: SolanaNetwork, tokens: Token[]) {
    const result: NetworkSpecificToken[] = [];

    for (const token of tokens) {
        const mintAddress = token.mintAddresses[network];
        if (mintAddress) {
            result.push({
                decimals: token.decimals,
                symbol: token.symbol,
                name: token.name,
                network,
                mintAddress,
            });
        }
    }

    return result;
}
