import { type EvmChain, type Signature, WalletClientBase } from "@goat-sdk/core";
import type { EVMReadRequest, EVMReadResult, EVMTransaction, EVMTransactionResult, EVMTypedData } from "./types";

export abstract class EVMWalletClient extends WalletClientBase {
    abstract getChain(): EvmChain;
    abstract sendTransaction(transaction: EVMTransaction): Promise<EVMTransactionResult>;
    abstract read(request: EVMReadRequest): Promise<EVMReadResult>;
    abstract signTypedData(data: EVMTypedData): Promise<Signature>;
    // abstract signTransaction(transaction: EVMTransaction, serializer?: Serializer): Promise<Signature>;
}
