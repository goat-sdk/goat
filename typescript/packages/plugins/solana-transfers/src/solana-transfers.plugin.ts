import { Chain, PluginBase } from "@goat-sdk/core";
import { SolanaTransfersService } from "./solana-transfers.service";

export class SolanaTransfersPlugin extends PluginBase {
    constructor() {
        super("solana-transfers", [new SolanaTransfersService()]);
    }

    supportsChain = (chain: Chain) => chain.type === "solana";
}

export function solanaTransfers() {
    return new SolanaTransfersPlugin();
}
