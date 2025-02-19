export type Token = {
    decimals: number;
    symbol: string;
    name: string;
    id: number;
    uri?: string;
    totalSupply?: number;
    chains: Record<number, { contractAddress: `0x${string}` }>;
};

export type ChainSpecificToken = {
    chainId: number;
    decimals: number;
    symbol: string;
    name: string;
    id: number;
    uri?: string;
    totalSupply?: number;
    contractAddress: `0x${string}`;
};

// ToDo: Add actual predefined tokens.
export const ENJ: Token = {
    decimals: 18,
    symbol: "ENJ",
    name: "Enjin",
    id: 1,
    chains: {
        "1": {
            contractAddress: "0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c",
        },
        "10": {
            contractAddress: "0xc1c167cc44f7923cd0062c4370df962f9ddb16f5",
        },
        "8453": {
            contractAddress: "0xb4fde59a779991bfb6a52253b51947828b982be3",
        },
    },
};

export function getTokensForNetwork(chainId: number, tokens: Token[]): ChainSpecificToken[] {
    const result: ChainSpecificToken[] = [];

    for (const token of tokens) {
        const chainData = token.chains[chainId];
        if (chainData) {
            result.push({
                chainId: chainId,
                decimals: token.decimals,
                symbol: token.symbol,
                name: token.name,
                id: token.id,
                uri: token.uri,
                totalSupply: token.totalSupply,
                contractAddress: chainData.contractAddress,
            });
        }
    }

    return result;
}