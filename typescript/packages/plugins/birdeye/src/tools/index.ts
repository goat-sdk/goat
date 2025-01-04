import { type ToolBase } from "@goat-sdk/core";
import type { EVMWalletClient } from "@goat-sdk/wallet-evm";
import type { BirdEyeOptions } from "../index";
import { getDefiTools } from "./defi";
import { getMarketTools } from "./market";
import { getTransactionTools } from "./transactions";

export function getTools(walletClient: EVMWalletClient, options: BirdEyeOptions): ToolBase[] {
    return [
        ...getDefiTools(walletClient, options),
        ...getTransactionTools(walletClient, options),
        ...getMarketTools(walletClient, options),
    ];
}

// Re-export all tool functions
export { getDefiTools } from "./defi";
export { getTransactionTools } from "./transactions";
export { getMarketTools } from "./market";
