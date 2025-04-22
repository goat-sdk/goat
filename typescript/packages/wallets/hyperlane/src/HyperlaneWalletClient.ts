import { ViemEVMWalletClient, ViemOptions } from "@goat-sdk/wallet-viem";
import { ethers } from "ethers";
import { WalletClient } from "viem";

export type HyperlaneViemOptions = {
    secretKey: string;
    paymaster?: {
        defaultAddress: `0x${string}`;
        defaultInput?: `0x${string}`;
    };
};

export class HyperlaneViemEVMWalletClient extends ViemEVMWalletClient {
    private signer: ethers.Signer;

    constructor(client: WalletClient, options: HyperlaneViemOptions) {
        const viemOptions: ViemOptions = {
            paymaster: options?.paymaster,
        };
        // TODO: rm @ts-ignore
        // @ts-ignore
        super(client, viemOptions);
        this.signer = new ethers.Wallet(options.secretKey);
    }

    getSigner(): ethers.Signer {
        return this.signer;
    }
    setSigner(privateKey: string) {
        this.signer = new ethers.Wallet(privateKey);
    }
}

export function hyperlaneViem(client: WalletClient, options: HyperlaneViemOptions) {
    return new HyperlaneViemEVMWalletClient(client, options);
}
