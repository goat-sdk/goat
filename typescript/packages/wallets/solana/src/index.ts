import type { SolanaReadRequest, SolanaTransaction, SolanaWalletClient } from "@goat-sdk/core";

import { type Connection, type Keypair, PublicKey, TransactionMessage, VersionedTransaction } from "@solana/web3.js";

import nacl from "tweetnacl";

export type SolanaWalletOptions = {
    keypair: Keypair;
    connection: Connection;
};

export function solana({ connection, keypair }: SolanaWalletOptions): SolanaWalletClient {
    return {
        getAddress: () => keypair.publicKey.toBase58(),
        getChain() {
            return {
                type: "solana",
            };
        },
        async signMessage(message: string) {
            const messageBytes = Buffer.from(message);
            const signature = nacl.sign.detached(messageBytes, keypair.secretKey);
            return {
                signature: Buffer.from(signature).toString("hex"),
            };
        },
        async sendTransaction({ instructions }: SolanaTransaction) {
            const latestBlockhash = await connection.getLatestBlockhash("confirmed");
            const message = new TransactionMessage({
                payerKey: keypair.publicKey,
                recentBlockhash: latestBlockhash.blockhash,
                instructions,
            }).compileToV0Message();
            const transaction = new VersionedTransaction(message);

            transaction.sign([keypair]);

            const txid = await connection.sendTransaction(transaction, {
                maxRetries: 5,
            });

            return {
                hash: txid,
            };
        },
        async read(request: SolanaReadRequest) {
            const { accountAddress } = request;

            const pubkey = new PublicKey(accountAddress);
            const accountInfo = await connection.getAccountInfo(pubkey);

            if (!accountInfo) {
                throw new Error(`Account ${accountAddress} not found`);
            }

            return {
                value: accountInfo,
            };
        },
        async balanceOf(address: string) {
            const pubkey = new PublicKey(address);
            const balance = await connection.getBalance(pubkey);

            return {
                decimals: 9,
                symbol: "SOL",
                name: "Solana",
                value: BigInt(balance),
            };
        },
    };
}
