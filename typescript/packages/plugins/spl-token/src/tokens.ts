import { z } from "zod";

export type SolanaNetwork = "devnet" | "mainnet";

export const splTokenSymbolSchema = z.enum(["USDC"]);
export type SplTokenSymbol = z.infer<typeof splTokenSymbolSchema>;

export type Token = {
    decimals: number;
    symbol: SplTokenSymbol;
    name: string;
    mintAddresses: Record<SolanaNetwork, string | null>;
};

export type NetworkSpecificToken = Omit<Token, "mintAddresses"> & {
    network: SolanaNetwork;
    mintAddress: string;
};

export const USDC: Token = {
    decimals: 6,
    symbol: splTokenSymbolSchema.Enum.USDC,
    name: "USDC",
    mintAddresses: {
        devnet: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
        mainnet: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    },
};

export const SPL_TOKENS: Token[] = [USDC];
