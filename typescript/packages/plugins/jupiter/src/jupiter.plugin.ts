import { type Chain, PluginBase } from "@goat-sdk/core";
import type { Connection } from "@solana/web3.js";

export class JupiterPlugin extends PluginBase {
    constructor(connection: Connection) {
        super("jupiter", []);
    }

    supportsChain = (chain: Chain) => chain.type === "solana";
}
