import { Chain, WalletClientBase } from "@goat-sdk/core";
import { TronWeb } from "tronweb";

export abstract class TronWalletClient extends WalletClientBase {
    protected tronWeb: TronWeb;
    protected fromAddress: string;

    constructor(tronWeb?: TronWeb) {
        super();
        // Allow injection of a TronWeb instance or fallback to Nile testnet endpoints.
        this.tronWeb =
            tronWeb ?? new TronWeb("https://nile.trongrid.io", "https://nile.trongrid.io", "https://nile.trongrid.io");
        this.fromAddress = "";
    }

    getChain(): Chain {
        return { type: "tron" } as const;
    }

    getAddress(): string {
        if (!this.fromAddress) {
            throw new Error("Wallet address is not set.");
        }
        return this.fromAddress;
    }

    async signMessage(message: string): Promise<{ signature: string }> {
        const hexMessage: string = this.tronWeb.toHex(message);
        const signature: string = await this.tronWeb.trx.sign(hexMessage);
        return { signature };
    }

    async balanceOf(address: string): Promise<{
        decimals: number;
        symbol: string;
        name: string;
        value: string;
        inBaseUnits: string;
    }> {
        if (!this.tronWeb.isAddress(address)) {
            throw new Error("Invalid Tron address.");
        }
        const balanceSun: number = await this.tronWeb.trx.getBalance(address);
        const balanceTRX: number = balanceSun / 1_000_000;
        return {
            decimals: 6,
            symbol: "TRX",
            name: "TRX",
            value: balanceTRX.toString(),
            inBaseUnits: balanceSun.toString(),
        };
    }

    async sendTransaction(transaction: { to: string; value: number }): Promise<{ hash: string }> {
        const { to, value } = transaction;
        if (!this.tronWeb.isAddress(to)) {
            throw new Error("Invalid recipient Tron address.");
        }
        const amountSun: number = Math.floor(value * 1_000_000);
        const unsignedTx = await this.tronWeb.transactionBuilder.sendTrx(to, amountSun, this.fromAddress);
        const signedTx = await this.tronWeb.trx.sign(unsignedTx);
        const broadcast = await this.tronWeb.trx.sendRawTransaction(signedTx);
        if (broadcast.result) {
            return { hash: signedTx.txID };
        }
        throw new Error("Transaction failed to broadcast.");
    }
}
