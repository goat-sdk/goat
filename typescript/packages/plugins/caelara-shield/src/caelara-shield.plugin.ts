import { type Chain, PluginBase } from "@goat-sdk/core";
import { CaelaraShieldApi } from "./api";
import { CaelaraShieldService } from "./caelara-shield.service";

export class CaelaraShieldPlugin extends PluginBase {
    constructor(api: CaelaraShieldApi = new CaelaraShieldApi()) {
        super("caelara-shield", [new CaelaraShieldService(api)]);
    }

    supportsChain(chain: Chain) {
        return true;
    }
}

/**
 * Factory function to create a new Caelara Shield plugin instance
 */
export function caelaraShield() {
    return new CaelaraShieldPlugin();
}
