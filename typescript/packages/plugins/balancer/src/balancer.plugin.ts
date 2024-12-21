import { type Chain, PluginBase } from "@goat-sdk/core";
import type { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { mainnet, polygon, arbitrum, optimism, gnosis } from "viem/chains";
import { BalancerService } from "./balancer.service";

const SUPPORTED_CHAINS = [mainnet, polygon, arbitrum, optimism, gnosis];

export class BalancerPlugin extends PluginBase<EVMWalletClient> {
    constructor() {
        super("balancer", [new BalancerService()]);
    }

    supportsChain = (chain: Chain) => chain.type === "evm" && SUPPORTED_CHAINS.some((c) => c.id === chain.id);
}

export const balancer = () => new BalancerPlugin(); 