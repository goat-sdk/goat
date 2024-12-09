import { SPL_TOKENS, type SolanaNetwork, type SplTokenSymbol } from "../tokens";
import { getTokensForNetwork } from "./getTokensForNetwork";

export function getTokenMintAddressBySymbol(symbol: SplTokenSymbol, network: SolanaNetwork) {
    const tokensForNetwork = getTokensForNetwork(network, SPL_TOKENS);
    const token = tokensForNetwork.find((token) => [token.symbol, token.symbol.toLowerCase()].includes(symbol));
    return token?.mintAddress || null;
}
