import { type SuiClient, type SuiObjectResponse } from "@mysten/sui.js/dist/cjs/client";
import { type TransactionBlock } from "@mysten/sui.js/dist/cjs/transactions";

export type SuiReadResponse = SuiObjectResponse & {
    object: SuiObjectResponse["data"];
};
export type SuiTransaction = {
    transaction: Uint8Array | TransactionBlock;
};
export type TransactionResponse = {
    hash: string;
};
export type SuiQuery = {
    contractAddress: string;
    method: string;
    args?: unknown[];
};
export type SuiWalletClientCtorParams = {
    client: SuiClient;
};
