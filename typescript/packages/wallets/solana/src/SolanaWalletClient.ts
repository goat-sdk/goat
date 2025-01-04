import { WalletClientBase } from "@goat-sdk/core";
import {
    AddressLookupTableAccount,
    type Connection,
    PublicKey,
    TransactionMessage,
    type VersionedTransaction,
} from "@solana/web3.js";
import { formatUnits } from "viem";
import type { SolanaTransaction } from "./types";
import { resolve } from "@bonfida/spl-name-service";
import bs58 from "bs58";

export type SolanWalletClientCtorParams = {
    connection: Connection;
};

export abstract class SolanaWalletClient extends WalletClientBase {
    protected connection: Connection;

    constructor(params: SolanWalletClientCtorParams) {
        super();
        this.connection = params.connection;
    }

    getChain() {
        return {
            type: "solana",
        } as const;
    }

    getConnection() {
        return this.connection;
    }

    async balanceOf(address: string) {
        const resolvedAddress = await this.resolveAddress(address);
        const pubkey = new PublicKey(resolvedAddress);
        const balance = await this.connection.getBalance(pubkey);

        return {
            decimals: 9,
            symbol: "SOL",
            name: "Solana",
            value: formatUnits(BigInt(balance), 9),
            inBaseUnits: balance.toString(),
        };
    }

    async decompileVersionedTransactionToInstructions(versionedTransaction: VersionedTransaction) {
        const lookupTableAddresses = versionedTransaction.message.addressTableLookups.map(
            (lookup) => lookup.accountKey,
        );
        const addressLookupTableAccounts = await Promise.all(
            lookupTableAddresses.map((address) =>
                this.connection.getAddressLookupTable(address).then((lookupTable) => lookupTable.value),
            ),
        );
        const nonNullAddressLookupTableAccounts = addressLookupTableAccounts.filter(
            (lookupTable) => lookupTable != null,
        );
        const decompileArgs = {
            addressLookupTableAccounts: nonNullAddressLookupTableAccounts,
        };
        return TransactionMessage.decompile(versionedTransaction.message, decompileArgs).instructions;
    }

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

    async resolveAddress(address: string): Promise<string> {
        if (!bs58.decodeUnsafe(address)) {
            const publicKey = await resolve(this.connection, address);
            return publicKey.toBase58();
        }
        return address;
    }

    abstract sendTransaction(transaction: SolanaTransaction): Promise<{ hash: string }>;
}
