import { WalletClientBase } from "@goat-sdk/core";
import { AddressLookupTableAccount, type Connection, PublicKey } from "@solana/web3.js";
import type { SolanaTransaction } from "./types";

export type SolanWalletClientCtorParams = {
    connection: Connection;
};

export abstract class SolanaWalletClient extends WalletClientBase {
    connection: Connection;

    constructor(params: SolanWalletClientCtorParams) {
        super();
        this.connection = params.connection;
    }

    getChain() {
        return {
            type: "solana",
        } as const;
    }

    async balanceOf(address: string) {
        const pubkey = new PublicKey(address);
        const balance = await this.connection.getBalance(pubkey);

        return {
            decimals: 9,
            symbol: "SOL",
            name: "Solana",
            value: BigInt(balance),
        };
    }

    abstract sendTransaction(transaction: SolanaTransaction): Promise<{ hash: string }>;

    protected async getAddressLookupTableAccounts(keys: string[]): Promise<AddressLookupTableAccount[]> {
        const addressLookupTableAccountInfos = await this.connection.getMultipleAccountsInfo(
            keys.map((key) => new PublicKey(key)),
        );

        return addressLookupTableAccountInfos.reduce((acc, accountInfo, index) => {
            const addressLookupTableAddress = keys[index];
            if (accountInfo) {
                const addressLookupTableAccount = new AddressLookupTableAccount({
                    key: new PublicKey(addressLookupTableAddress),
                    state: AddressLookupTableAccount.deserialize(accountInfo.data),
                });
                acc.push(addressLookupTableAccount);
            }

            return acc;
        }, new Array<AddressLookupTableAccount>());
    }
}