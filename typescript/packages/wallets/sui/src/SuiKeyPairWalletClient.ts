import type { Signature } from "@goat-sdk/core";
import { SuiClient } from "@mysten/sui.js/dist/cjs/client";
import { Ed25519Keypair } from "@mysten/sui.js/dist/cjs/keypairs/ed25519";
import { TransactionBlock } from "@mysten/sui.js/dist/cjs/transactions";
import { SuiWalletClient } from "./SuiWalletClient";
import type { SuiQuery, SuiReadResponse, SuiTransaction, TransactionResponse } from "./types";

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

    async sendTransaction(transaction: SuiTransaction): Promise<TransactionResponse> {
        const transactionBlock = transaction.transaction instanceof TransactionBlock
            ? transaction.transaction
            : TransactionBlock.from(transaction.transaction);

        const result = await this.client.signAndExecuteTransactionBlock({
            transactionBlock,
            signer: this.keypair
        });

        await this.client.waitForTransactionBlock({
            digest: result.digest
        });

        return { hash: result.digest };
    }

    async read(query: SuiQuery): Promise<SuiReadResponse> {
        // Use dynamic field or object read based on the query
        const result = await this.client.getObject({
            id: query.contractAddress,
            options: {
                showContent: true,
            },
        });

        return {
            object: result.data,
            ...result,
        };
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
