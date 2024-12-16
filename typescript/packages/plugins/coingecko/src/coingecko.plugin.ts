import { PluginBase } from "@goat-sdk/core";
import { CoinGeckoService } from "./coingecko.service";

export class CoinGeckoPlugin extends PluginBase {
    constructor(apiKey: string) {
        super("coingecko", [new CoinGeckoService(apiKey)]);
    }

    supportsChain = () => true;
}

export function coingecko(apiKey: string) {
    return new CoinGeckoPlugin(apiKey);
}
