import type { ISolana } from "@dynamic-labs/solana-core";
import type { SolanaReadRequest, SolanaTransaction, SolanaWalletClient } from "@goat-sdk/core";
import { type Connection, PublicKey, TransactionMessage, VersionedTransaction } from "@solana/web3.js";

export function createSolanaWalletFromDynamic(connection: Connection, signer: ISolana): SolanaWalletClient {
    const publicKey = signer.publicKey;
    if (!publicKey) {
        throw new Error("Signer public key is undefined");
    }

    return {
        getAddress: () => new PublicKey(publicKey.toBytes()).toBase58(),
        getChain() {
            return {
                type: "solana",
            };
        },
        async signMessage(message: string) {
            const messageBytes = Buffer.from(message);
            const signature = await signer.signMessage(messageBytes);
            return {
                signature: Buffer.from(signature.signature).toString("hex"),
            };
        },
        async sendTransaction({ instructions }: SolanaTransaction) {
            const latestBlockhash = await connection.getLatestBlockhash("confirmed");
            const message = new TransactionMessage({
                payerKey: new PublicKey(publicKey.toBytes()),
                recentBlockhash: latestBlockhash.blockhash,
                instructions,
            }).compileToV0Message();
            const transaction = new VersionedTransaction(message);
            const signedTx = await signer.signTransaction(transaction);

            const txid = await connection.sendTransaction(signedTx, {
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
