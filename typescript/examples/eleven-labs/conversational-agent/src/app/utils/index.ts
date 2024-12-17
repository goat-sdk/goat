import type { ISolana } from "@dynamic-labs/solana-core";
import { SolanaTransaction, SolanaWalletClient, SolanWalletClientCtorParams } from "@goat-sdk/wallet-solana";
import { type Connection, PublicKey, TransactionMessage, VersionedTransaction } from "@solana/web3.js";

export function createSolanaWalletFromDynamic(connection: Connection, signer: ISolana): SolanaWalletClient {
    const publicKey = signer.publicKey;
    if (!publicKey) {
        throw new Error("Signer public key is undefined");
    }

    class DynamicSolanaWallet extends SolanaWalletClient {
        private readonly signer: ISolana;

        constructor(params: SolanWalletClientCtorParams & { signer: ISolana }) {
            super({
                connection: params.connection,
            });

            this.signer = params.signer;
        }

        getAddress() {
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            return new PublicKey(this.signer.publicKey!.toBytes()).toBase58();
        }

        getChain() {
            return {
                type: "solana",
            } as const;
        }

        async signMessage(message: string) {
            const messageBytes = Buffer.from(message);
            const signature = await signer.signMessage(messageBytes);

            return {
                signature: Buffer.from(signature.signature).toString("hex"),
            };
        }

        async sendTransaction({ instructions }: SolanaTransaction) {
            const latestBlockhash = await connection.getLatestBlockhash("confirmed");
            const message = new TransactionMessage({
                payerKey: new PublicKey(this.getAddress()),
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
        }

        async balanceOf(address: string) {
            const pubkey = new PublicKey(address);
            const balance = await connection.getBalance(pubkey);

            return {
                decimals: 9,
                symbol: "SOL",
                name: "Solana",
                value: BigInt(balance),
            };
        }
    }

    return new DynamicSolanaWallet({ connection, signer });
}
