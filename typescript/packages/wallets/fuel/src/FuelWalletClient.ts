import { WalletClientBase } from "@goat-sdk/core";
import { bn, formatUnits, TransactionRequest, WalletUnlocked } from "fuels";

export type FuelWalletCtorParams = {
    fuelWallet: WalletUnlocked;
};

export class FuelWalletClient extends WalletClientBase {
    private fuelWallet: WalletUnlocked;

    constructor(public readonly params: FuelWalletCtorParams) {
        super();
        this.fuelWallet = params.fuelWallet;
    }

    getAddress() {
        return this.fuelWallet.address.toB256();
    }

    getChain() {
        return {
            type: "fuel",
        } as const;
    }

    async signMessage(message: string) {
        const signature = (
            await this.fuelWallet.signMessage(message)
        ).toString();
        return {
            signature,
        };
    }

    async sendTransaction({
        transactionRequest,
    }: {
        transactionRequest: TransactionRequest;
    }) {
        const tx = await this.fuelWallet.sendTransaction(transactionRequest);
        const { id } = await tx.waitForResult();
        return {
            hash: id,
        };
    }

    async transfer(to: string, amount: string) {
        const amountInWei = bn.parseUnits(amount);

        const tx = await this.fuelWallet.transfer(to, amountInWei);
        const { id } = await tx.waitForResult();
        return {
            hash: id,
        };
    }

    async balanceOf(address: string) {
        const provider = this.fuelWallet.provider;
        const balance = await provider.getBalance(
            address,
            provider.getBaseAssetId()
        );

        return {
            decimals: 9,
            symbol: "ETH",
            name: "ETH",
            value: formatUnits(balance),
            inBaseUnits: balance.toString(),
        };
    }
}

export function fuel({ fuelWallet }: FuelWalletCtorParams) {
    return new FuelWalletClient({ fuelWallet });
}
