import type { SolanaTransaction } from "@goat-sdk/core";
import { WalletClientBase } from "@goat-sdk/core-v2";
import { PublicKey, type Connection } from "@solana/web3.js";

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
