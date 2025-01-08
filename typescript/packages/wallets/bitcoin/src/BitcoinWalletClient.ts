import { Balance, Chain, Signature, WalletClientBase } from "@goat-sdk/core";
import type { BitcoinQuery, BitcoinTransaction, BitcoinTransactionResponse } from "./types";

export abstract class BitcoinWalletClient extends WalletClientBase {
    getChain(): Chain {
        return {
            type: "bitcoin",
        };
    }

    abstract getAddress(): string;

    abstract signMessage(message: string): Promise<Signature>;

    abstract balanceOf(address: string): Promise<Balance>;

    abstract sendTransaction(transaction: BitcoinTransaction): Promise<BitcoinTransactionResponse>;

    abstract read(query: BitcoinQuery): Promise<Balance | BitcoinTransactionResponse>;
}
