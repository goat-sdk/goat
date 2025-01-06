import { Chain, PluginBase } from "@goat-sdk/core";
import { LensService } from "./lens.service";

export class LensPlugin extends PluginBase {
    constructor() {
        super("lens", [new LensService()]);
    }

    supportsChain = (chain: Chain) => chain.type === "evm";
}

export const lens = () => new LensPlugin();
