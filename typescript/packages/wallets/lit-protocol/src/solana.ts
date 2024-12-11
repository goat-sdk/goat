import type {
    Signature,
    SolanaReadRequest,
    SolanaReadResult,
    SolanaTransaction,
    SolanaTransactionResult,
    SolanaWalletClient,
} from "@goat-sdk/core";
import { api, SerializedTransaction } from "@lit-protocol/wrapped-keys";
import { PublicKey, Transaction } from "@solana/web3.js";

import type { LitSolanaWalletOptions } from "./types";

const { signMessageWithEncryptedKey, signTransactionWithEncryptedKey } = api;

export function createSolanaWallet(options: LitSolanaWalletOptions): SolanaWalletClient {
    const { litNodeClient, pkpSessionSigs, wrappedKeyMetadata, connection, chain } = options;

    return {
        getAddress: () => wrappedKeyMetadata.publicKey,
        getChain: () => ({
            type: "solana",
        }),
        async signMessage(message: string): Promise<Signature> {
            return {
                signature: await signMessageWithEncryptedKey({
                    pkpSessionSigs,
                    network: "solana",
                    id: wrappedKeyMetadata.id,
                    messageToSign: message,
                    litNodeClient,
                })
            }
        },
        async sendTransaction(
            { instructions }: SolanaTransaction
        ): Promise<SolanaTransactionResult> {
            const latestBlockhash = await connection.getLatestBlockhash("confirmed");
            const tx = new Transaction();
            tx.recentBlockhash = latestBlockhash.blockhash;
            tx.feePayer = new PublicKey(wrappedKeyMetadata.publicKey);
            tx.add(...instructions);

            const serializedTransaction = tx
                .serialize({
                    requireAllSignatures: false,
                    verifySignatures: false,
                })
                .toString("base64");
            const litTransaction: SerializedTransaction = {
                serializedTransaction,
                chain,
            };
            
            const signedTransaction = await signTransactionWithEncryptedKey({
                litNodeClient,
                pkpSessionSigs,
                network: "solana",
                id: wrappedKeyMetadata.id,
                unsignedTransaction: litTransaction,
                broadcast: true,
            });
            
            return {
                hash: signedTransaction,
            };
        },
        async read(request: SolanaReadRequest): Promise<SolanaReadResult> {
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