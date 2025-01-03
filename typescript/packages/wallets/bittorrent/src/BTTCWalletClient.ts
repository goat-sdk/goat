import { type EvmChain, type Signature, WalletClientBase } from "@goat-sdk/core";
import type { EVMReadRequest, EVMReadResult, BTTCTransaction, BTTCTypedData } from "./types";

export abstract class BTTCWalletClient extends WalletClientBase {
    abstract getChain(): EvmChain;
    abstract sendTransaction(transaction: BTTCTransaction): Promise<{ hash: string }>;
    abstract read(request: EVMReadRequest): Promise<EVMReadResult>;
    abstract resolveAddress(address: string): Promise<`0x${string}`>;
    abstract signTypedData(data: BTTCTypedData): Promise<Signature>;
}
