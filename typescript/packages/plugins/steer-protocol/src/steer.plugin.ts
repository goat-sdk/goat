import { type Chain, PluginBase } from "@goat-sdk/core";
import type { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { arbitrum, mainnet } from "viem/chains";
import { SteerService } from "./steer.service";

const SUPPORTED_CHAINS = [mainnet, arbitrum];

export class SteerPlugin extends PluginBase<EVMWalletClient> {
    constructor() {
        super("steer", [new SteerService()]);
    }

    supportsChain = (chain: Chain) => chain.type === "evm" && SUPPORTED_CHAINS.some((c) => c.id === chain.id);
}

export const steer = () => new SteerPlugin();
