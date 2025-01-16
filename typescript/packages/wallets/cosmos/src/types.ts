import { EncodeObject } from "@cosmjs/proto-signing";
import { DeliverTxResponse, QueryAbciResponse } from "@cosmjs/stargate";
import { CosmosChain, WalletClientBase } from "@goat-sdk/core";

export type CosmosTransaction = {
    message: EncodeObject;
};

export type CosmosReadRequest = {
    message: EncodeObject;
};

export type CosmosReadResult = {
    value: QueryAbciResponse;
};

export type CosmosTransactionResult = {
    value: DeliverTxResponse;
};

export type CosmosBalanceResponse = {
    value: string;
};

export abstract class CosmosWalletClient extends WalletClientBase {
    abstract getChain(): CosmosChain;
    abstract getChainId(): Promise<string>;
    abstract sendTransaction(transaction: CosmosTransaction): Promise<CosmosTransactionResult>;
    abstract read(request: CosmosReadRequest): Promise<CosmosReadResult>;
}
