import { Chain, PluginBase } from "@goat-sdk/core";

import { WorldstoreService } from "./worldstore.service";

export class WorldstorePlugin extends PluginBase {
    constructor() {
        super("worldstore", [new WorldstoreService()]);
    }

    supportsChain(chain: Chain) {
        // base and base sepolia
        return chain.type === "evm" && [8453, 84532].includes(chain.id);
    }
}

export const worldstore = () => new WorldstorePlugin();
