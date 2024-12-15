import { type Signature, WalletClientBase, type EvmChain } from "@goat-sdk/core-v2";
import type { EVMReadRequest, EVMReadResult, EVMTransaction, EVMTypedData } from "./types";

export abstract class EVMWalletClient extends WalletClientBase {
    abstract getChain(): EvmChain;
    abstract sendTransaction(transaction: EVMTransaction): Promise<{ hash: string }>;
    abstract read(request: EVMReadRequest): Promise<EVMReadResult>;
    abstract resolveAddress(address: string): Promise<`0x${string}`>;
    abstract signTypedData(data: EVMTypedData): Promise<Signature>;
}
