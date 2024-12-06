import type { Abi, TypedDataDomain as AbiTypedDataDomainType } from "abitype";
import type { Signature, WalletClient } from "./core";

export function isEVMWalletClient(wallet: WalletClient): wallet is EVMWalletClient {
    return wallet.getChain().type === "evm";
}

export type EVMTransaction = {
    to: string;
    functionName?: string;
    args?: unknown[];
    value?: bigint;
    abi?: Abi;
};

export type EVMReadRequest = {
    address: string;
    functionName: string;
    args?: unknown[];
    abi: Abi;
};

export type EVMTransactionResult = {
    hash: string;
    status: string;
};

export type EVMReadResult = {
    value: unknown;
};

export type EVMTypedData = {
    domain: TypedDataDomain;
    types: Record<string, unknown>;
    primaryType: string;
    message: Record<string, unknown>;
};

export type TypedDataDomain = AbiTypedDataDomainType;

export interface EVMWalletClient extends WalletClient {
    sendTransaction: (transaction: EVMTransaction) => Promise<EVMTransactionResult>;
    read: (request: EVMReadRequest) => Promise<EVMReadResult>;
    resolveAddress: (address: string) => Promise<`0x${string}`>;
    signTypedData: (data: EVMTypedData) => Promise<Signature>;
}
