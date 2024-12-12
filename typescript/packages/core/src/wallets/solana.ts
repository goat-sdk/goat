import type { TransactionInstruction } from "@solana/web3.js";
import type { WalletClient } from "./core";

export function isSolanaWalletClient(wallet: WalletClient): wallet is SolanaWalletClient {
    return wallet.getChain().type === "solana";
}

export type SolanaTransaction = {
    instructions: TransactionInstruction[];
};

export type SolanaReadRequest = {
    accountAddress: string;
};

export type SolanaReadResult = {
    value: unknown;
};

export type SolanaTransactionResult = {
    hash: string;
};

export interface SolanaWalletClient extends WalletClient {
    sendTransaction: (transaction: SolanaTransaction) => Promise<SolanaTransactionResult>;
    read: (request: SolanaReadRequest) => Promise<SolanaReadResult>;
}
