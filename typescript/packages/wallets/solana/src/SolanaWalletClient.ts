import { WalletClientBase } from "@goat-sdk/core";
import { type Connection, PublicKey } from "@solana/web3.js";
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
}
