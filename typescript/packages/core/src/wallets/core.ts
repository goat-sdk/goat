export type Signature = {
    signature: string;
};

export type Balance = {
    decimals: number;
    symbol: string;
    name: string;
    value: bigint;
};

/**
 * @param type - "evm" or "solana", extend this union as needed (e.g., "sui")
 * @param id - Chain ID, optional for EVM
 */
export type Chain = {
    type: "evm" | "solana" | "aptos";
    id?: number; // optional for EVM
};

export type EVMChain = Chain & {
    type: "evm";
};

export type SolanaChain = Chain & {
    type: "solana";
};

export type AptosChain = Chain & {
    type: "aptos";
};

export interface WalletClient {
    getAddress: () => string;
    getChain: () => Chain;
    signMessage: (message: string) => Promise<Signature>;
    balanceOf: (address: string) => Promise<Balance>;
}
