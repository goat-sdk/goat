import { Chain, PluginBase } from "@goat-sdk/core";
import { Connection } from "@solana/web3.js";
import { SolanaNftsService } from "./solana-nfts.service";

export class SolanaNftsPlugin extends PluginBase {
    constructor(connection: Connection) {
        super("solana-nfts", [new SolanaNftsService(connection)]);
    }

    supportsChain = (chain: Chain) => chain.type === "solana";
}
