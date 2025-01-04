import { type SuiClient, type SuiObjectResponse } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";

export type SuiReadResponse = SuiObjectResponse & {
    object: SuiObjectResponse["data"];
};

export type SuiTransaction = {
    transactionBlock: Uint8Array | TransactionBlock;
};

export type TransactionResponse = {
    hash: string;
    // Add other transaction response fields as needed
};

export type SuiQuery = {
    // Add query type details here
    contractAddress: string;
    method: string;
    args?: unknown[];
};

export type SuiWalletClientCtorParams = {
    client: SuiClient;
};
