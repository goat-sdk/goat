import { type Chain, PluginBase } from "@goat-sdk/core";
import { AvnuService } from "./avnu.service";

export class AvnuPlugin extends PluginBase {
    constructor() {
        super("avnu", [new AvnuService()]);
    }

    supportsChain = (chain: Chain) => chain.type === "starknet";
}

export const avnu = () => new AvnuPlugin();
