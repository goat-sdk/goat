// src/types/TronTypes.ts

export type TronChain = {
    type: "tron";
    // Optionally, you could add more fields (for example, name, symbol, decimals)
    name?: string; // e.g., "Tron Mainnet"
    symbol?: string; // e.g., "TRX"
    decimals?: number; // e.g., 6
};
