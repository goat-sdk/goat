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
