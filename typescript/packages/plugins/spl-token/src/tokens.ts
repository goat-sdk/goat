export type SolanaNetwork = "devnet" | "mainnet";

export type Token = {
    decimals: number;
    symbol: string;
    name: string;
    mintAddresses: Record<SolanaNetwork, string | null>;
};

export type NetworkSpecificToken = Omit<Token, "mintAddresses"> & {
    network: SolanaNetwork;
    mintAddress: string;
};

export const USDC: Token = {
    decimals: 6,
    symbol: "USDC",
    name: "USDC",
    mintAddresses: {
        devnet: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
        mainnet: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    },
};

export const GOAT: Token = {
    decimals: 6,
    symbol: "GOAT",
    name: "GOAT",
    mintAddresses: {
        mainnet: "CzLSujWBLFsSjncfkh59rUFqvafWcY5tzedWJSuypump",
        devnet: null,
    },
};

export const PENGU: Token = {
    decimals: 6,
    symbol: "PENGU",
    name: "Pengu",
    mintAddresses: {
        mainnet: "2zMMhcVQEXDtdE6vsFS7S7D5oUodfJHE8vd1gnBouauv",
        devnet: null,
    },
};

export const SOL: Token = {
    decimals: 9,
    symbol: "SOL",
    name: "Wrapped SOL",
    mintAddresses: {
        mainnet: "So11111111111111111111111111111111111111112",
        devnet: "So11111111111111111111111111111111111111112",
    },
};

export const SPL_TOKENS: Token[] = [USDC, GOAT, PENGU, SOL];
