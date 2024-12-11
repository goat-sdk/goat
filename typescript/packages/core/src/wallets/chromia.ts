
import { DictPair, QueryObject, RawGtv } from "postchain-client";
import { TransactionWithReceipt } from "@chromia/ft4";
import type { WalletClient } from "./core";

export function isChromiaWalletClient(wallet: WalletClient): wallet is ChromiaWalletClient {
    return wallet.getChain().type === "chromia";
}

export type ChromiaTransaction = {
    to: string;
    assetId: string;
    amount: string;
};

export type ChromiaReadRequest =  string | QueryObject<RawGtv | DictPair>;

export type ChromiaReadResult = RawGtv;

export type ChromiaTransactionResult = TransactionWithReceipt;

export interface ChromiaWalletClient extends WalletClient {
    sendTransaction: (transaction: ChromiaTransaction) => Promise<ChromiaTransactionResult>;
    read: (request: ChromiaReadRequest) => Promise<ChromiaReadResult>;
}
