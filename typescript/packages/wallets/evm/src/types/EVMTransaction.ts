import type { Abi } from "abitype";

type Address = `0x${string}`;

type AccessList = readonly {
    address: Address;
    storageKeys: readonly Address[];
}[];

export type EVMTransaction = {
    to: string;
    functionName?: string;
    args?: unknown[];
    value?: bigint;
    abi?: Abi;
    options?: EVMTransactionOptions;
    data?: Address;
    maxFeePerGas?: bigint; // EIP-1559
    maxPriorityFeePerGas?: bigint; // EIP-1559
    accessList?: AccessList; // EIP-2930
    nonce?: number;
    gas?: bigint; // gas limit
    // type?: TransactionType,      // can be inferred from maxFeePerGas, maxPriorityFeePerGas, gasPrice, accessList
};

export type EVMTransactionOptions = {
    paymaster?: {
        address: Address;
        input: Address;
    };
};

export type EVMTransactionResult = {
    // TODO: figure out if these can be null or not
    hash: string;
    status: string;
    blockHash?: Address;
    blockNumber?: bigint;
    contractAddress?: string | null;
    cumulativeGasUsed?: bigint;
    effectiveGasPrice?: bigint;
    from?: Address;
    gasUsed?: bigint;
    logs?: [
        {
            address: Address,
            blockHash: Address,
            blockNumber: bigint,
            data: string,
            logIndex: number,
            removed: boolean,
            topics: Address[],
            transactionHash: Address,
            transactionIndex: number,
        }
    ];
    logsBloom?: Address;
    to?: Address;
    transactionHash?: Address;
    transactionIndex?: number;
    type?: string;
};