export type Token = {
    decimals: number;
    symbol: string;
    name: string;
    chains: Record<number, { contractAddress: `0x${string}` }>;
};
