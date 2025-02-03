import { CrossmintApiClient } from "@crossmint/common-sdk-base";
import { type SolanaTransaction, SolanaWalletClient } from "@goat-sdk/wallet-solana";
import { type Connection, PublicKey, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import bs58 from "bs58";
import { CrossmintWalletsAPI } from "./CrossmintWalletsAPI";

export type SolanaSmartWalletOptions = {
    connection: Connection;
    linkedUser?: {
        email?: string;
        phone?: string;
        userId?: number;
    };
    address?: string;
};

function getLocator(address: string | undefined, linkedUser: SolanaSmartWalletOptions["linkedUser"]): string {
    if (linkedUser) {
        if (linkedUser.email) return `email:${linkedUser.email}:solana-smart-wallet`;
        if (linkedUser.phone) return `phone:${linkedUser.phone}:solana-smart-wallet`;
        if (linkedUser.userId) return `userId:${linkedUser.userId}:solana-smart-wallet`;
    }
    if (!address) throw new Error("Either address or linkedUser must be provided");
    return address;
}

export class SolanaSmartWalletClient extends SolanaWalletClient {
    readonly #locator: string;
    readonly #api: CrossmintWalletsAPI;
    readonly #address: string;

    constructor(api: CrossmintWalletsAPI, address: string, options: SolanaSmartWalletOptions) {
        super({ connection: options.connection });
        this.#api = api;
        this.#address = address;
        this.#locator = getLocator(options.address, options.linkedUser);
    }

    getAddress() {
        return this.#address;
    }

    async signMessage(message: string) {
        try {
            const { id: signatureId } = await this.#api.signMessageForCustodialWallet(this.#locator, message);
            while (true) {
                const latestSignature = await this.#api.checkSignatureStatus(signatureId, this.#address);
                if (latestSignature.status === "success") {
                    if (!latestSignature.outputSignature) {
                        throw new Error("Signature is undefined");
                    }
                    return {
                        signature: latestSignature.outputSignature,
                    };
                }
                if (latestSignature.status === "failed") {
                    throw new Error("Signature failed");
                }
                await new Promise((resolve) => setTimeout(resolve, 2000));
            }
        } catch (error) {
            throw new Error(`Failed to sign message: ${error}`);
        }
    }

    async sendTransaction({ instructions, addressLookupTableAddresses = [] }: SolanaTransaction) {
        try {
            const publicKey = new PublicKey(this.#address);
            const message = new TransactionMessage({
                payerKey: publicKey,
                recentBlockhash: await this.connection.getLatestBlockhash().then((res) => res.blockhash),
                instructions,
            }).compileToV0Message(await this.getAddressLookupTableAccounts(addressLookupTableAddresses));

            const transaction = new VersionedTransaction(message);
            const serializedVersionedTransaction = transaction.serialize();
            const encodedVersionedTransaction = bs58.encode(serializedVersionedTransaction);
            const { id: transactionId } = await this.#api.createTransactionForCustodialWallet(
                this.#locator,
                encodedVersionedTransaction,
            );

            while (true) {
                const latestTransaction = await this.#api.checkTransactionStatus(this.#locator, transactionId);
                if (latestTransaction.status === "success") {
                    return {
                        hash: latestTransaction.onChain?.txId ?? "",
                    };
                }
                if (latestTransaction.status === "failed") {
                    throw new Error(`Transaction failed: ${latestTransaction.onChain?.txId}`);
                }
                await new Promise((resolve) => setTimeout(resolve, 2000));
            }
        } catch (error) {
            throw new Error(`Failed to send transaction: ${error}`);
        }
    }

    async sendRawTransaction(transaction: string): Promise<{ hash: string }> {
        try {
            const { id: transactionId } = await this.#api.createTransactionForCustodialWallet(
                this.#locator,
                transaction,
            );
            while (true) {
                const latestTransaction = await this.#api.checkTransactionStatus(this.#locator, transactionId);
                if (latestTransaction.status === "success") {
                    return {
                        hash: latestTransaction.onChain?.txId ?? "",
                    };
                }
                if (latestTransaction.status === "failed") {
                    throw new Error(`Transaction failed: ${latestTransaction.onChain?.txId}`);
                }
                await new Promise((resolve) => setTimeout(resolve, 2000));
            }
        } catch (error) {
            throw new Error(`Failed to send raw transaction: ${error}`);
        }
    }
}

export function solanaSmartWalletFactory(crossmintClient: CrossmintApiClient) {
    const walletsApi = new CrossmintWalletsAPI(crossmintClient);
    return async function solanaSmartWallet(options: SolanaSmartWalletOptions) {
        const locator = getLocator(options.address, options.linkedUser);
        let address: string;

        if (options.address) {
            const wallet = await walletsApi.getWallet(locator);
            address = wallet.address;
        } else {
            const wallet = await walletsApi.createSmartWallet(undefined, "solana-smart-wallet");
            address = wallet.address;
        }

        return new SolanaSmartWalletClient(walletsApi, address, options);
    };
}
