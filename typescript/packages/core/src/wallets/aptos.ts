import {
    Aptos,
    type InputGenerateTransactionPayloadData,
    type InputViewFunctionData,
    type LedgerVersionArg,
} from "@aptos-labs/ts-sdk";
import type { WalletClient } from "./core";

export function isAptosWalletClient(wallet: WalletClient): wallet is AptosWalletClient {
    return wallet.getChain().type === "aptos";
}

export type AptosTransaction = {
    transactionData: InputGenerateTransactionPayloadData;
};

export type AptosReadRequest = {
    viewFunctionData: InputViewFunctionData;
    ledgerVersionArg?: LedgerVersionArg;
};

export type AptosReadResult = {
    value: unknown;
};

export type AptosTransactionResult = {
    hash: string;
};

export interface AptosWalletClient extends WalletClient {
    sendTransaction: (transaction: AptosTransaction) => Promise<AptosTransactionResult>;
    read: (request: AptosReadRequest) => Promise<AptosReadResult>;
}
