import ZtxChainSDK from "zetrix-sdk-nodejs";
import { WalletClientBase } from "@goat-sdk/core";

export type ZETRIXWalletCtorParams = {
    zetrixSDK: ZtxChainSDK;
    zetrixAccount: string;
    zetrixAccountPrivateKey: string;
};

export class ZetrixWalletClient extends WalletClientBase {
    private zetrixAccount: string;
    private zetrixAccountPrivateKey: string;
    sdk: ZtxChainSDK;

    constructor(params: ZETRIXWalletCtorParams) {
        super();
        this.sdk = params.zetrixSDK;
        this.zetrixAccount = params.zetrixAccount;
        this.zetrixAccountPrivateKey = params.zetrixAccountPrivateKey;
    }

    getAddress() {
        return this.zetrixAccount;
    }

    getChain() {
        return {
            type: "zetrix",
        } as const;
    }

    async signMessage(message: string) {
        const signatureInfo = await this.sdk.transaction.sign({
            privateKeys: [ this.zetrixAccountPrivateKey ],
            blob: message,
        });
        return signatureInfo.result.signatures;
    }

    async sendTransaction(blob: string, signature: string) {
        const transactionInfo = await this.sdk.transaction.submit({
            blob,
            signature
        });
        return transactionInfo.result.hash;
    }

    async balanceOf(address: string) {
        const data = await this.sdk.account.getBalance(address);
        return {
            decimals: 6,
            symbol: "ZETRIX",
            name: "ZETRIX",
            value: data.result.balance.toString(),
            inBaseUnits: data.result.balance.toString(),
        };
    }

    async getNonce(address: string) {
        const data = await this.sdk.account.getNonce(address);
        return data.result.nonce;
    }

    async buildSendZETRIXBlob(to: string, amount: string) {
        let nonce = await this.getNonce(this.zetrixAccount);
        nonce = nonce + 1;

        const operationInfo = this.sdk.operation.gasSendOperation({
            sourceAddress: this.zetrixAccount,
            destAddress: to,
            gasAmount: amount.toString(),
            metadata: 'Send ZETRIX',
        });
        const operationItem = operationInfo.result.operation;

        const blobInfo = this.sdk.transaction.buildBlob({
            sourceAddress: this.zetrixAccount,
            gasPrice: '1000',
            feeLimit: '30000',
            nonce,
            operations: [ operationItem ],
        });
        const blob = blobInfo.result.transactionBlob;

        return blob;
    }
}

export function zetrix(params: ZETRIXWalletCtorParams) {
    return new ZetrixWalletClient(params);
}