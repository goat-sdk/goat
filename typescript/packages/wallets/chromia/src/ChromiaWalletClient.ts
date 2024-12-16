import { type Connection, type KeyStoreInteractor, createAmount } from "@chromia/ft4";
import { WalletClientBase } from "@goat-sdk/core-v2";
import type { DictPair, IClient, QueryObject, RawGtv } from "postchain-client";
import { CHR_ASSET_ID } from "./consts";
import type { ChromiaTransaction } from "./types/ChromiaTransaction";

export type ChromiaWalletParams = {
    client: IClient;
    keystoreInteractor: KeyStoreInteractor;
    accountAddress: string;
    connection: Connection;
};

export class ChromiaWalletClient extends WalletClientBase {
    constructor(public readonly params: ChromiaWalletParams) {
        super();
    }

    getAddress(): string {
        return this.params.accountAddress;
    }

    getChain() {
        return { type: "chromia" } as const;
    }

    async signMessage(message: string) {
        // TODO: Implement keystore signing
        return { signature: "" };
    }

    async sendTransaction({ to, assetId, amount }: ChromiaTransaction) {
        const { keystoreInteractor, connection } = this.params;
        const accounts = await keystoreInteractor.getAccounts();
        const session = await keystoreInteractor.getSession(accounts[0].id);
        const asset = await connection.getAssetById(assetId);
        if (!asset) {
            throw new Error("Asset not found");
        }
        const amountToSend = createAmount(amount, asset.decimals);
        return await session.account.transfer(to, assetId, amountToSend);
    }

    async read(nameOrQueryObject: string | QueryObject<RawGtv | DictPair>) {
        return this.params.client.query(nameOrQueryObject);
    }

    async balanceOf(address: string) {
        const account = await this.params.connection.getAccountById(address);
        if (account) {
            const balance = await account.getBalanceByAssetId(CHR_ASSET_ID);
            if (balance) {
                return {
                    decimals: balance.asset.decimals,
                    symbol: balance.asset.symbol,
                    name: balance.asset.name,
                    value: BigInt(balance.amount.value),
                };
            }
        }
        return {
            decimals: 0,
            symbol: "CHR",
            name: "Chromia",
            value: BigInt(0),
        };
    }
}
