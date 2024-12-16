/**
 * @param type - "evm" or "solana", extend this union as needed (e.g., "sui")
 * @param id - Chain ID, optional for EVM
 */
export type Chain = EvmChain | SolanaChain | AptosChain | ChromiaChain;

export type EvmChain = {
    type: "evm";
    id: number;
};

export type SolanaChain = {
    type: "solana";
};

export type AptosChain = {
    type: "aptos";
};

export type ChromiaChain = {
    type: "chromia";
};
