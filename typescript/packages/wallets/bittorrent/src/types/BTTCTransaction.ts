import type { Abi } from "abitype";

export type BTTCTransaction = {
    to: string;
    functionName?: string;
    args?: unknown[];
    value?: bigint;
    abi?: Abi;
    options?: BTTCTransactionOptions;
    data?: `0x${string}`;
};

export type BTTCTransactionOptions = {
    paymaster?: {
        address: `0x${string}`;
        input: `0x${string}`;
    };
};
