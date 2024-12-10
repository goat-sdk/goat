import type {
    Signature,
    SolanaReadRequest,
    SolanaReadResult,
    SolanaTransaction,
    SolanaTransactionResult,
    SolanaWalletClient,
} from "@goat-sdk/core";

import type { LitSolanaWalletOptions } from "./types";

export function createSolanaWallet(options: LitSolanaWalletOptions): SolanaWalletClient {
    const { pkpSessionSigs, litNodeClient, wrappedKeyId } = options;
    
    return {
        getChain: () => ({
            type: "solana",
        }),
        getAddress: () => "", // TODO: Get address from wrapped key metadata
        async signMessage(message: string): Promise<Signature> {
            // TODO: Implement Solana message signing using Lit Action
            throw new Error("Not implemented");
        },
        async sendTransaction(
            transaction: SolanaTransaction
        ): Promise<SolanaTransactionResult> {
            // TODO: Implement Solana transaction signing and sending using Lit Action
            throw new Error("Not implemented");
        },
        async read(request: SolanaReadRequest): Promise<SolanaReadResult> {
            // TODO: Implement Solana read using connection
            throw new Error("Not implemented");
        },
        async balanceOf(address: string) {
            // TODO: Implement balance check using connection
            throw new Error("Not implemented");
        },
    };
} 