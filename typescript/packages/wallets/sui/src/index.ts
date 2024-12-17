import type { SuiReadRequest, SuiTransaction, SuiWalletClient } from "@goat-sdk/core";

import type { SuiClient } from "@mysten/sui/client";
import type { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";

export type SuiWalletOptions = {
    suiAccount: Ed25519Keypair;
    suiClient: SuiClient;
};

export function sui({ suiAccount, suiClient }: SuiWalletOptions): SuiWalletClient {
    return {
        getAddress: () => suiAccount.getPublicKey().toSuiAddress(),
        getChain() {
            return {
                type: "sui",
            };
        },
        async signMessage(message: string) {
            const s = new TextEncoder().encode(message);
            const { signature } = await suiAccount.signPersonalMessage(s);
            return {
                signature,
            };
        },
        async sendTransaction({ transaction }: SuiTransaction) {
            const result = await suiClient.signAndExecuteTransaction({
                signer: suiAccount,
                transaction,
            });
            const response = await suiClient.waitForTransaction({
                digest: result.digest,
                options: {
                    showEffects: true,
                },
            });
            return {
                hash: response.digest,
            };
        },
        async read({ address }: SuiReadRequest) {
            const value = await suiClient.getCoins({
                owner: address,
            });
            return {
                value,
            };
        },
        async balanceOf(address: string) {
            const balance = await suiClient.getBalance({
                owner: address,
            });
            return {
                decimals: 9,
                symbol: "SUI",
                name: "Sui",
                value: BigInt(balance.totalBalance),
            };
        },
    };
}
