import { WalletClientBase } from "@goat-sdk/core";
import BigNumber from "bignumber.js";
import ZtxChainSDK from "zetrix-sdk-nodejs";

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
            privateKeys: [this.zetrixAccountPrivateKey],
            blob: message,
        });
        return signatureInfo.result.signatures;
    }

    async sendTransaction(blob: string, signature: string) {
        const transactionInfo = await this.sdk.transaction.submit({
            blob,
            signature,
        });
        return transactionInfo.result.hash;
    }

    async balanceOf(address: string) {
        const data = await this.sdk.account.getBalance(address);
        return {
            decimals: 6,
            symbol: "ZETRIX",
            name: "ZETRIX",
            value: (Number(data.result.balance) * 10 ** -6).toString(),
            inBaseUnits: data.result.balance.toString(),
        };
    }

    async getNonce(address: string) {
        const data = await this.sdk.account.getNonce(address);
        return data.result.nonce;
    }

    async buildSendZETRIXBlob(to: string, amount: string) {
        let nonce = await this.getNonce(this.zetrixAccount);
        nonce = new BigNumber(nonce).plus(1).toString(10);
        const operationInfo = this.sdk.operation.gasSendOperation({
            sourceAddress: this.zetrixAccount,
            destAddress: to,
            gasAmount: (Number(amount) * 10 ** 6).toString(),
            metadata: "Send ZETRIX",
        });
        const operationItem = operationInfo.result.operation;

        const blobInfo = this.sdk.transaction.buildBlob({
            sourceAddress: this.zetrixAccount,
            gasPrice: "1000",
            feeLimit: "500000",
            nonce,
            operations: [operationItem],
        });
        const blob = blobInfo.result.transactionBlob;
        return blob;
    }
}

export function zetrix(params: ZETRIXWalletCtorParams) {
    return new ZetrixWalletClient(params);
}
