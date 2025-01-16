/**
 * @param type - "evm" or "solana", extend this union as needed (e.g., "sui")
 * @param id - Chain ID, optional for EVM
 */
export type Chain =
    | EvmChain
    | SolanaChain
    | AptosChain
    | ChromiaChain
    | FuelChain
    | SuiChain
    | ZilliqaChain
    | CosmosChain;

export type SuiChain = {
    type: "sui";
};

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

export type FuelChain = {
    type: "fuel";
};

export type ZilliqaChain = {
    type: "zilliqa";
    id: number;
    evmId: number;
};

export type CosmosChain = {
    type: "cosmos";
};
