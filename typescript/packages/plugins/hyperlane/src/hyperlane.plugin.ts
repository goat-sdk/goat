import { PluginBase } from "@goat-sdk/core";
import { HyperlaneService } from "./hyperlane.service";

export class HyperlanePlugin extends PluginBase {
    constructor() {
        super("hyperlane", [new HyperlaneService()]);
    }

    supportsChain = () => true;
}

export function hyperlane() {
    return new HyperlanePlugin();
}
