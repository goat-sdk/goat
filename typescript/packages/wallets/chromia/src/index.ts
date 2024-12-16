import { type Connection, type KeyStoreInteractor, createAmount } from "@chromia/ft4";
import { type DictPair, type IClient, type QueryObject, type RawGtv, SignatureProvider } from "postchain-client";

export enum CHROMIA_MAINNET_BRID {
    ECONOMY_CHAIN = "15C0CA99BEE60A3B23829968771C50E491BD00D2E3AE448580CD48A8D71E7BBA",
}
export const CHR_ASSET_ID = "5f16d1545a0881f971b164f1601cbbf51c29efd0633b2730da18c403c3b428b5";

export type ChromiaWalletOptions = {
    client: IClient;
    keystoreInteractor: KeyStoreInteractor;
    accountAddress: string;
    connection: Connection;
};

export type ChromiaTransaction = {
    to: string;
    assetId: string;
    amount: string;
};

export function chromia({ client, keystoreInteractor, accountAddress, connection }: ChromiaWalletOptions) {
    return {
        getAddress: () => {
            return accountAddress;
        },
        getChain(): { type: "chromia" } {
            return {
                type: "chromia",
            };
        },
        async signMessage(message: string) {
            // TODO: Implement keystore signing
            return { signature: "" };
        },
        async sendTransaction({ to, assetId, amount }: ChromiaTransaction) {
            if (!to.match(/^[a-f0-9]{64}$/i)) {
                throw new Error("Invalid Address");
            }
            const accounts = await keystoreInteractor.getAccounts();
            const session = await keystoreInteractor.getSession(accounts[0].id);
            const asset = await connection.getAssetById(assetId);
            if (!asset) {
                throw new Error("Asset not found");
            }
            const amountToSend = createAmount(amount, asset.decimals);
            return await session.account.transfer(to, assetId, amountToSend);
        },
        async read(nameOrQueryObject: string | QueryObject<RawGtv | DictPair>) {
            return client.query(nameOrQueryObject);
        },
        async balanceOf(address: string) {
            const account = await connection.getAccountById(address);
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
        },
    };
}
