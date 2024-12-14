import type { AptosReadRequest, AptosTransaction, AptosWalletClient } from "@goat-sdk/core";

import type { Account, Aptos } from "@aptos-labs/ts-sdk";

export type AptosWalletOptions = {
    aptosAccount: Account;
    aptosClient: Aptos;
};

export function aptos({ aptosAccount, aptosClient }: AptosWalletOptions): AptosWalletClient {
    return {
        getAddress: () => aptosAccount.accountAddress.toStringLong(),
        getChain() {
            return {
                type: "aptos",
            };
        },
        async signMessage(message: string) {
            const signature = aptosAccount.sign(message).toString();
            return {
                signature,
            };
        },
        async sendTransaction({ transactionData }: AptosTransaction) {
            const transaction = await aptosClient.transaction.build.simple({
                sender: aptosAccount.accountAddress,
                data: transactionData,
            });
            const response = await aptosClient
                .signAndSubmitTransaction({
                    signer: aptosAccount,
                    transaction,
                })
                .then((tx) => aptosClient.waitForTransaction({ transactionHash: tx.hash }));
            return {
                hash: response.hash,
            };
        },
        async read({ viewFunctionData, ledgerVersionArg }: AptosReadRequest) {
            const value = await aptosClient.view({
                payload: viewFunctionData,
                options: ledgerVersionArg,
            });
            return {
                value,
            };
        },
        async balanceOf(address: string) {
            const balance = await aptosClient.getAccountAPTAmount({
                accountAddress: address,
            });
            return {
                decimals: 8,
                symbol: "APT",
                name: "Aptos",
                value: BigInt(balance),
            };
        },
    };
}
