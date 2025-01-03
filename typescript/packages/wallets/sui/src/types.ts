import { type SuiClient } from "@mysten/sui.js/client";

export type AwesomeChainResponse = unknown;

export type SuiTransaction = {
    to: string;
    amount: string;
    // Add other transaction parameters as needed
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
