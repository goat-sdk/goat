import type { Signature } from "@goat-sdk/core";
import { SuiClient, type SuiTransactionBlockResponse } from "@mysten/sui.js/client";
import { type Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { SuiWalletClient } from "./SuiWalletClient";
import type { AwesomeChainResponse, SuiQuery, SuiTransaction, Transaction } from "./types";

export type SuiKeyPairWalletClientParams = {
    client: SuiClient;
    keypair: Ed25519Keypair;
};

export class SuiKeyPairWalletClient extends SuiWalletClient {
    private keypair: Ed25519Keypair;

    constructor(params: SuiKeyPairWalletClientParams) {
        super({ client: params.client });
        this.keypair = params.keypair;
    }

    async sendTransaction(transaction: SuiTransaction): Promise<Transaction> {
        const txb = new TransactionBlock();
        // Create a transfer transaction
        txb.transferObjects([txb.gas], txb.pure(transaction.to));

        // Sign and execute the transaction
        const result = await this.client.signAndExecuteTransactionBlock({
            transactionBlock: txb,
            signer: this.keypair,
        });

        return {
            hash: result.digest,
        };
    }

    async read(query: SuiQuery): Promise<AwesomeChainResponse> {
        // Use dynamic field or object read based on the query
        const result = await this.client.getObject({
            id: query.contractAddress,
            options: {
                showContent: true,
            },
        });

        return result;
    }

    getAddress(): string {
        return this.keypair.getPublicKey().toSuiAddress();
    }

    async signMessage(message: string): Promise<Signature> {
        const signatureArray = await this.keypair.sign(new TextEncoder().encode(message));
        const signature = Buffer.from(signatureArray).toString("base64");
        return { signature };
    }
}
