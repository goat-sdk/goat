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
    from?: Address;
    chainId?: number;
    type?: "legacy" | "eip2930" | "eip1559" | "eip4844" | "eip7702" | undefined; // 0: legacy, 1: EIP-2930, 2: EIP-1559
    customData?: Record<string, unknown>;
    ccipReadEnabled?: boolean;
};

export type EVMTransactionOptions = {
    paymaster?: {
        address: Address;
        input: Address;
    };
};

export type TransactionLog = {
    address: Address;
    blockHash: Address;
    blockNumber: bigint;
    data: string;
    logIndex: number;
    removed: boolean;
    topics: Address[];
    transactionHash: Address;
    transactionIndex: number;
};

export type EVMTransactionResult = {
    hash: string;
    status?: string;
    blockHash?: Address;
    blockNumber?: bigint;
    contractAddress?: string | null;
    cumulativeGasUsed?: bigint;
    effectiveGasPrice?: bigint;
    from?: Address;
    gasUsed?: bigint;
    logs?: TransactionLog[];
    logsBloom?: Address;
    to?: Address | null;
    transactionHash?: Address;
    transactionIndex?: number;
    type?: string;
};
