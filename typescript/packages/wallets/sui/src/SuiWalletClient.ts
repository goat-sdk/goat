import { WalletClientBase } from "@goat-sdk/core";
import type { Chain } from "@goat-sdk/core";
import type { Balance, Signature } from "@goat-sdk/core";
import { type SuiClient } from "@mysten/sui.js/client";
import type { AwesomeChainResponse, SuiQuery, SuiTransaction, SuiWalletClientCtorParams, Transaction } from "./types";

export abstract class SuiWalletClient extends WalletClientBase {
    protected client: SuiClient;

    constructor(params: SuiWalletClientCtorParams) {
        super();
        this.client = params.client;
    }

    getChain(): Chain {
        return {
            type: "sui",
        } as const;
    }

    getClient() {
        return this.client;
    }

    abstract getAddress(): string;

    abstract signMessage(message: string): Promise<Signature>;

    abstract sendTransaction(transaction: SuiTransaction): Promise<Transaction>;

    abstract read(query: SuiQuery): Promise<AwesomeChainResponse>;

    async balanceOf(address: string): Promise<Balance> {
        const balance = await this.client.getBalance({
            owner: address,
        });

        return {
            decimals: 9,
            symbol: "SUI",
            name: "Sui",
            value: balance.totalBalance,
            inBaseUnits: balance.totalBalance,
        };
    }
}