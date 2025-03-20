// src/TronWalletClient.ts

import { Chain, WalletClientBase } from "@goat-sdk/core";
import { TronWeb } from "tronweb";

export abstract class TronWalletClient extends WalletClientBase {
    protected tronWeb: TronWeb;
    protected fromAddress = "";

    constructor() {
        super();
        // Initialize TronWeb using public endpoints (adjust these URLs if needed)
        this.tronWeb = new TronWeb("https://api.trongrid.io", "https://api.trongrid.io", "https://api.trongrid.io");
    }

    // Return a minimal chain object identifying this chain as "tron"
    getChain(): Chain {
        return { type: "tron" } as const;
    }

    // Return the wallet address (Base58 format)
    getAddress(): string {
        if (!this.fromAddress) {
            throw new Error("Wallet address is not set.");
        }
        return this.fromAddress;
    }

    // Sign a message using TronWeb's signing functionality
    async signMessage(message: string): Promise<{ signature: string }> {
        const hexMessage = this.tronWeb.toHex(message);
        const signature = await this.tronWeb.trx.sign(hexMessage);
        return { signature };
    }

    // Return the TRX balance for a given address.
    // Note: TronWeb returns balances in SUN (1 TRX = 1,000,000 SUN).
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
        const balanceSun = await this.tronWeb.trx.getBalance(address);
        const balanceTRX = balanceSun / 1_000_000;
        return {
            decimals: 6,
            symbol: "TRX",
            name: "TRX",
            value: balanceTRX.toString(),
            inBaseUnits: balanceSun.toString(),
        };
    }

    // Send a TRX transaction from the wallet to another address.
    async sendTransaction(transaction: { to: string; value: number }): Promise<{ hash: string }> {
        const { to, value } = transaction;
        if (!this.tronWeb.isAddress(to)) {
            throw new Error("Invalid recipient Tron address.");
        }
        // Convert the amount from TRX to SUN.
        const amountSun = Math.floor(value * 1_000_000);

        // Build an unsigned transaction
        const unsignedTx = await this.tronWeb.transactionBuilder.sendTrx(to, amountSun, this.fromAddress);

        // Sign the transaction (the private key must already be set on tronWeb)
        const signedTx = await this.tronWeb.trx.sign(unsignedTx);
        // Broadcast the signed transaction
        const broadcast = await this.tronWeb.trx.sendRawTransaction(signedTx);
        if (broadcast.result) {
            return { hash: signedTx.txID };
        }
        throw new Error("Transaction failed to broadcast.");
    }
}
