import { TronWalletClient } from "./TronWalletClient";

export class TronKeyPairWalletClient extends TronWalletClient {
    private privateKey: string;

    constructor(privateKey: string) {
        super();
        if (!privateKey || privateKey.length !== 64) {
            throw new Error("Invalid Tron private key.");
        }
        this.privateKey = privateKey;
        // Configure TronWeb with the provided private key for signing transactions.
        this.tronWeb.setPrivateKey(privateKey);
        // Derive the wallet address (Base58 format) from the private key.
        const address = this.tronWeb.address.fromPrivateKey(privateKey);
        if (!address || typeof address !== "string") {
            throw new Error("Failed to derive a valid address from the provided private key.");
        }
        this.fromAddress = address;
    }
}
