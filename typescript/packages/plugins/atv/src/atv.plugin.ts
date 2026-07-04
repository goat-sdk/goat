import { type Chain, PluginBase } from "@goat-sdk/core";
import { ATVAPI } from "./api";
import { ATVService } from "./atv.service";
import { ATVTransactionService } from "./atv.transaction.service";

export interface ATVPluginOptions {
    baseUrl?: string;
    apiKey?: string;
}

export class ATVPlugin extends PluginBase {
    constructor({ baseUrl = ATVAPI.DEFAULT_BASE_URL, apiKey }: ATVPluginOptions = {}) {
        const api = new ATVAPI(baseUrl, apiKey);
        super("atv", [new ATVService(api), new ATVTransactionService(api)]);
    }

    supportsChain = (chain: Chain) => chain.type === "evm";
}

export function atv(options: ATVPluginOptions = {}) {
    return new ATVPlugin(options);
}
