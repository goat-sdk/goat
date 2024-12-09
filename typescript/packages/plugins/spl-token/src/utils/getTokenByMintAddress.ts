import { SPL_TOKENS, type SolanaNetwork } from "../tokens";
import { getTokensForNetwork } from "./getTokensForNetwork";

export function getTokenByMintAddress(mintAddress: string, network: SolanaNetwork) {
    const tokensForNetwork = getTokensForNetwork(network, SPL_TOKENS);
    const token = tokensForNetwork.find((token) => token.mintAddress === mintAddress);
    return token || null;
}
