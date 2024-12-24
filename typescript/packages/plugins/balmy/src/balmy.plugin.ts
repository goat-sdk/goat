import { type Chain, PluginBase } from "@goat-sdk/core";
import { BalmyService } from "./balmy.service";
import { type Token } from "./types";

export type BalmyPluginCtorParams = {
    tokens?: Token[];
};

export class BalmyPlugin extends PluginBase {
    constructor({ tokens = [] }: BalmyPluginCtorParams = {}) {
        super("balmy", [new BalmyService({ tokens })]);
    }

    supportsChain = (chain: Chain) => chain.type === "evm";
}

export function balmy(params: BalmyPluginCtorParams = {}) {
    return new BalmyPlugin(params);
} 