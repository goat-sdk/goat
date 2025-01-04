import { type SuiClient, type SuiObjectResponse } from "@mysten/sui.js/client";
import { Transaction } from "@mysten/sui.js/transactions";

export type SuiReadResponse = SuiObjectResponse & {
    object: SuiObjectResponse["data"];
};

export type SuiTransaction = {
    transaction: Transaction;
};

export type Transaction = {
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
