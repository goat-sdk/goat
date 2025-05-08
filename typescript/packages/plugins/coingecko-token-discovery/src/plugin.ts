import { PluginBase } from "@goat-sdk/core";
import { CoinGeckoTokenDiscoveryAPI } from "./api";
import { TokenDiscoveryService } from "./token-discovery.service";

interface CoinGeckoTokenDiscoveryPluginOptions {
    apiKey: string;
}

export class CoinGeckoTokenDiscoveryPlugin extends PluginBase {
    constructor({ apiKey }: CoinGeckoTokenDiscoveryPluginOptions) {
        const api = new CoinGeckoTokenDiscoveryAPI(apiKey);
        const service = new TokenDiscoveryService(api);

        super("coingecko-token-discovery", [service]);
    }

    supportsChain = () => true;
}

export function coinGeckoTokenDiscovery(options: CoinGeckoTokenDiscoveryPluginOptions) {
    return new CoinGeckoTokenDiscoveryPlugin(options);
}
