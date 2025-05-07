import { Tool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { OneShotClient } from "@uxly/1shot-client";
import { ListEscrowWalletsParams, ListTransactionsParams } from "./parameters.js";

export class TransactionService {
    public constructor(
        protected readonly oneShotClient: OneShotClient,
        protected readonly businessId: string,
    ) {}

    @Tool({
        name: "list_transactions",
        description: "Returns a paginated list of transactions for the configured business. ",
    })
    async listTransactions(_walletClient: EVMWalletClient, parameters: ListTransactionsParams) {
        const transactions = await this.oneShotClient.transactions.list(this.businessId, parameters);
        console.log(transactions);
        return transactions;
    }

    @Tool({
        name: "list_escrow_wallets",
        description: "Returns a paginated list of Escrow Wallets for the configured business. ",
    })
    async listEscrowWallets(_walletClient: EVMWalletClient, parameters: ListEscrowWalletsParams) {
        const wallets = await this.oneShotClient.wallets.list(this.businessId, parameters);
        console.log(wallets);
        return wallets;
    }
}
