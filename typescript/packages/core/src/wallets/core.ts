import type { Chain } from "./chain";

export type Signature = {
    signature: string;
};

export type Balance = {
    decimals: number;
    symbol: string;
    name: string;
    value: bigint;
};

export interface WalletClient {
    getAddress: () => string;
    getChain: () => Chain;
    signMessage: (message: string) => Promise<Signature>;
    balanceOf: (address: string) => Promise<Balance>;
}
