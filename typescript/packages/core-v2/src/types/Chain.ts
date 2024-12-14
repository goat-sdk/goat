/**
 * @param type - "evm" or "solana", extend this union as needed (e.g., "sui")
 * @param id - Chain ID, optional for EVM
 */
export type Chain = {
    type: "evm" | "solana" | "aptos" | "chromia";
    id?: number; // optional for EVM
};
