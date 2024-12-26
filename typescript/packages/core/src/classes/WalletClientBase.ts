import { z } from "zod";
import type { Chain } from "../types/Chain";
import { type ToolBase, createTool } from "./ToolBase";

export type Signature = {
    signature: string;
};

export type Balance = {
    decimals: number;
    symbol: string;
    name: string;
    value: string;
    inBaseUnits: string;
};

export abstract class WalletClientBase {
    abstract getAddress(): string;
    abstract getChain(): Chain;
    abstract signMessage(message: string): Promise<Signature>;
    abstract balanceOf(address: string): Promise<Balance>;

    getCoreTools(): ToolBase[] {
        return [
            createTool(
                {
                    name: "get_address",
                    description: "Get the address of the wallet",
                    parameters: z.object({}),
                },
                () => this.getAddress(),
            ),
            createTool(
                {
                    name: "get_chain",
                    description: "Get the chain of the wallet",
                    parameters: z.object({}),
                },
                () => this.getChain(),
            ),
            createTool(
                {
                    name: "get_balance",
                    description: "Get the balance of the wallet",
                    parameters: z.object({ address: z.string() }),
                },
                (parameters) => this.balanceOf(parameters.address),
            ),
        ];
    }
}
