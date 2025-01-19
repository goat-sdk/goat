import { type Chain, PluginBase } from "@goat-sdk/core";
import { AvnuService } from "./avnu.service";

const SUPPORTED_CHAINS = ["starknet"];

export class AvnuPlugin extends PluginBase {
    constructor() {
        super("avnu", [new AvnuService()]);
    }

    supportsChain = (chain: Chain) => chain.type === "starknet";
}

export const Avnu = () => new AvnuPlugin();
