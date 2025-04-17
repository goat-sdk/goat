import type { Abi } from "abitype";

type AccessList = readonly {
    address: `0x${string}`;
    storageKeys: readonly `0x${string}`[];
}[];

export type EVMTransaction = {
    to: string;
    functionName?: string;
    args?: unknown[];
    value?: bigint;
    abi?: Abi;
    options?: EVMTransactionOptions;
    data?: `0x${string}`;
    maxFeePerGas?: bigint; // EIP-1559
    maxPriorityFeePerGas?: bigint; // EIP-1559
    accessList?: AccessList; // EIP-2930
    nonce?: number;
    gas?: bigint; // gas limit
    // type?: TransactionType,      // can be inferred from maxFeePerGas, maxPriorityFeePerGas, gasPrice, accessList
};

export type EVMTransactionOptions = {
    paymaster?: {
        address: `0x${string}`;
        input: `0x${string}`;
    };
};
