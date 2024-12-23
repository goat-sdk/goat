import { PluginBase } from "@goat-sdk/core";
import { BalancerService } from "./balancer.service";

export class BalancerPlugin extends PluginBase {
    constructor() {
        super("balancer", [new BalancerService()]);
    }

    supportsChain = () => true;
}

export function balancer() {
    return new BalancerPlugin();
} 