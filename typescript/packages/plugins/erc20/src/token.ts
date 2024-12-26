export type Token = {
    decimals: number;
    symbol: string;
    name: string;
    chains: Record<number, { contractAddress: `0x${string}` }>;
};

export type ChainSpecificToken = {
    chainId: number;
    decimals: number;
    symbol: string;
    name: string;
    contractAddress: `0x${string}`;
};

export const PEPE: Token = {
    decimals: 18,
    symbol: "PEPE",
    name: "Pepe",
    chains: {
        "1": {
            contractAddress: "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
        },
        "10": {
            contractAddress: "0xc1c167cc44f7923cd0062c4370df962f9ddb16f5",
        },
        "8453": {
            contractAddress: "0xb4fde59a779991bfb6a52253b51947828b982be3",
        },
    },
};

export const USDC: Token = {
    decimals: 6,
    symbol: "USDC",
    name: "USDC",
    chains: {
        "1": {
            contractAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        },
        "10": {
            contractAddress: "0x0b2c639c533813f4aa9d7837caf62653d097ff85",
        },
        "137": {
            contractAddress: "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359",
        },
        "8453": {
            contractAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        },
        "84532": {
            contractAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
        },
        "11155111": {
            contractAddress: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
        },
        "34443": {
            contractAddress: "0xd988097fb8612cc24eeC14542bC03424c656005f",
        },
    },
};

export const MODE: Token = {
    decimals: 18,
    symbol: "MODE",
    name: "Mode",
    chains: {
        "34443": {
            contractAddress: "0xDfc7C877a950e49D2610114102175A06C2e3167a",
        },
    },
};

export const WETH: Token = {
    decimals: 18,
    symbol: "WETH",
    name: "Wrapped Ether",
    chains: {
        "1": {
            contractAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        },
        "8453": {
            contractAddress: "0x4200000000000000000000000000000000000006",
        },
        "34443": {
            contractAddress: "0x4200000000000000000000000000000000000006",
        },
        "42161": {
            contractAddress: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
        },
        "10": {
            contractAddress: "0x4200000000000000000000000000000000000006",
        },
        "137": {
            contractAddress: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
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
                contractAddress: chainData.contractAddress,
            });
        }
    }

    return result;
}
