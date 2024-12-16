import type { Chain } from "../types/Chain";

export type Signature = {
    signature: string;
};

export type Balance = {
    decimals: number;
    symbol: string;
    name: string;
    value: bigint;
};

export abstract class WalletClientBase {
    abstract getAddress(): string;
    abstract getChain(): Chain;
    abstract signMessage(message: string): Promise<Signature>;
    abstract balanceOf(address: string): Promise<Balance>;
}
