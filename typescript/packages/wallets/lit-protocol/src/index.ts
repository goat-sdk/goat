import type {
    EVMWalletClient,
    SolanaWalletClient,
} from "@goat-sdk/core";

import { createEVMWallet } from "./evm";
import { createSolanaWallet } from "./solana";
import type { LitEVMWalletOptions, LitSolanaWalletOptions } from "./types";

export function lit(options: LitEVMWalletOptions): EVMWalletClient;
export function lit(options: LitSolanaWalletOptions): SolanaWalletClient;
export function lit(options: LitEVMWalletOptions | LitSolanaWalletOptions): EVMWalletClient | SolanaWalletClient {
    if (options.network === "evm") {
        return createEVMWallet(options);
    } else {
        return createSolanaWallet(options);
    }
}

export * from "./setup";
