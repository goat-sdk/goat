import { PluginBase } from "@goat-sdk/core";
import { CoinGeckoService } from "./coingecko.service";

interface CoingeckoPluginOptions {
    apiKey: string;
}

export class CoinGeckoPlugin extends PluginBase {
    constructor({ apiKey }: CoingeckoPluginOptions) {
        super("coingecko", [new CoinGeckoService(apiKey)]);
    }

    supportsChain = () => true;
}

export function coingecko(options: CoingeckoPluginOptions) {
    return new CoinGeckoPlugin(options);
}
