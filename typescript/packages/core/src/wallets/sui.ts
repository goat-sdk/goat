import type { Transaction } from "@mysten/sui/transactions";
import type { WalletClient } from "./core";

export function isSuiWalletClient(wallet: WalletClient): wallet is SuiWalletClient {
    return wallet.getChain().type === "sui";
}

export type SuiTransaction = {
    transaction: Transaction;
};

export type SuiReadRequest = {
    address: string;
};

export type SuiReadResult = {
    value: unknown;
};

export type SuiTransactionResult = {
    hash: string;
};

export interface SuiWalletClient extends WalletClient {
    sendTransaction: (transaction: SuiTransaction) => Promise<SuiTransactionResult>;
    read: (request: SuiReadRequest) => Promise<SuiReadResult>;
}
