import { CrossmintApiClient } from "@crossmint/common-sdk-base";
import { Signature } from "@goat-sdk/core";
import { type SolanaTransaction, SolanaWalletClient } from "@goat-sdk/wallet-solana";
import { type Connection, PublicKey, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import bs58 from "bs58";
import nacl from "tweetnacl";
import { CrossmintWalletsAPI } from "./CrossmintWalletsAPI";

export type SolanaSmartWalletOptions = {
    connection: Connection;
    config: {
        adminSigner:
            | {
                  type: "solana-keypair";
                  secretKey: string;
              }
            | {
                  type: "solana-fireblocks-custodial";
              };
    };
} & (
    | {
          linkedUser: {
              email?: string;
              phone?: string;
              userId?: number;
          };
          address?: never;
      }
    | {
          address: string;
          linkedUser?: never;
      }
);

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
    readonly #adminSigner: SolanaSmartWalletOptions["config"]["adminSigner"];

    constructor(api: CrossmintWalletsAPI, address: string, options: SolanaSmartWalletOptions) {
        super({ connection: options.connection });
        this.#api = api;
        this.#address = address;
        this.#adminSigner = options.config.adminSigner;
        this.#locator = getLocator(options.address, options.linkedUser);
    }

    private static deriveAddressFromSecretKey(secretKey: string): string {
        try {
            const decoded = bs58.decode(secretKey);
            const keyPair = nacl.sign.keyPair.fromSecretKey(decoded);
            return bs58.encode(Buffer.from(keyPair.publicKey));
        } catch (error) {
            throw new Error(`Invalid secret key: ${error}`);
        }
    }

    private async sendApprovals(transactionId: string, message: string, signerPrivateKey: Uint8Array): Promise<void> {
        try {
            const signature = nacl.sign.detached(bs58.decode(message), signerPrivateKey);
            const encodedSignature = bs58.encode(signature);

            const signerStr =
                this.#adminSigner.type === "solana-keypair"
                    ? `solana-keypair:${SolanaSmartWalletClient.deriveAddressFromSecretKey(this.#adminSigner.secretKey)}`
                    : "";

            // Send approval with signature
            const approvals = [
                {
                    signer: signerStr,
                    signature: encodedSignature,
                },
            ];

            await this.#api.approveTransaction(this.#locator, transactionId, approvals);
        } catch (error) {
            throw new Error(`Failed to send transaction approval: ${error}`);
        }
    }

    getAddress() {
        return this.#address;
    }

    async signMessage(message: string): Promise<Signature> {
        throw new Error("Signing not supported for smart wallets");
    }

    async sendTransaction({
        instructions,
        addressLookupTableAddresses = [],
    }: SolanaTransaction): Promise<{ hash: string }> {
        try {
            const publicKey = new PublicKey(this.#address);
            const message = new TransactionMessage({
                payerKey: publicKey,
                recentBlockhash: "11111111111111111111111111111111", // Filled by API
                instructions,
            }).compileToV0Message(await this.getAddressLookupTableAccounts(addressLookupTableAddresses));

            const transaction = new VersionedTransaction(message);
            const serializedVersionedTransaction = transaction.serialize();
            const encodedVersionedTransaction = bs58.encode(serializedVersionedTransaction);

            const hash = await this.sendRawTransaction(encodedVersionedTransaction);

            return hash;
        } catch (error) {
            throw new Error(`Failed to send transaction: ${error}`);
        }
    }

    async sendRawTransaction(transaction: string): Promise<{ hash: string }> {
        try {
            const { id: transactionId } = await this.#api.createSolanaTransaction(this.#locator, transaction);
            while (true) {
                const latestTransaction = await this.#api.checkTransactionStatus(this.#locator, transactionId);
                if (latestTransaction.status === "success") {
                    return {
                        hash: latestTransaction.onChain?.txId ?? "",
                    };
                }
                if (latestTransaction.status === "failed") {
                    throw new Error(`Transaction failed: ${latestTransaction.error}`);
                }
                if (latestTransaction.status === "awaiting-approval") {
                    if (this.#adminSigner.type === "solana-keypair") {
                        const message = latestTransaction.approvals?.pending?.[0]?.message;
                        if (message) {
                            await this.sendApprovals(transactionId, message, bs58.decode(this.#adminSigner.secretKey));
                        }
                    }
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
            const wallet = await walletsApi.createSmartWallet(options.config.adminSigner, "solana-smart-wallet");
            address = wallet.address;
        }

        return new SolanaSmartWalletClient(walletsApi, address, options);
    };
}
