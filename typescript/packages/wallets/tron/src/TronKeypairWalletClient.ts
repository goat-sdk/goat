import { TronWeb } from "tronweb";
import { TronWalletClient } from "./TronWalletClient";

export type TronKeypairWalletClientCtorParams = {
    tronWeb: TronWeb;
    address: string;
    privateKey: string;
};

export class TronKeyPairWalletClient extends TronWalletClient {
    private privateKey: string;

    constructor(params: TronKeypairWalletClientCtorParams) {
        super(params.tronWeb);
        if (!params.privateKey || params.privateKey.length !== 64) {
            throw new Error("Invalid Tron private key.");
        }
        this.privateKey = params.privateKey;
        if (!params.tronWeb.isAddress(params.address)) {
            throw new Error("Invalid Tron address derived from the provided private key.");
        }
        this.fromAddress = params.address;
    }
}

export const tron = (params: TronKeypairWalletClientCtorParams) => new TronKeyPairWalletClient(params);
