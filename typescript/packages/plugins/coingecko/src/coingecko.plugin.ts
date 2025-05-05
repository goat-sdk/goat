import { PluginBase } from "@goat-sdk/core";
import { CoinGeckoAPI } from "./api";
import { CoinGeckoService } from "./coingecko.service";
import { CoinGeckoProService } from "./pro.service";

interface CoingeckoPluginOptions {
    apiKey: string;
    isPro?: boolean;
}

export class CoinGeckoPlugin extends PluginBase {
    public services: Record<string, (...args: any[]) => any>;

    constructor({ apiKey, isPro = false }: CoingeckoPluginOptions) {
        const api = new CoinGeckoAPI(apiKey, isPro);
        const commonService = new CoinGeckoService(api);

        const services = [commonService];

        if (isPro) {
            services.push(new CoinGeckoProService(api));
        }

        super("coingecko", services);

        // Dynamically map all methods from services to `this.services`
        this.services = {};
        for (const service of services) {
            const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(service))
                .filter(name => name !== "constructor" && typeof (service as any)[name] === "function");

            for (const methodName of methodNames) {
                if (!this.services[methodName]) {
                    this.services[methodName] = (...args: any[]) => (service as any)[methodName](...args);
                }
            }
        }
    }

    supportsChain = () => true;
}

export function coingecko(options: CoingeckoPluginOptions) {
    return new CoinGeckoPlugin(options);
}