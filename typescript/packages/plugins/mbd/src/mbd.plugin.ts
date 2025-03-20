import { PluginBase, WalletClientBase } from "@goat-sdk/core";
import { MBDSocialService } from "./mbd.service";

export interface MBDSocialPluginConfig {
    mbdApiKey: string;
    neynarApiKey: string;
}

export class MBDSocialPlugin extends PluginBase<WalletClientBase> {
    constructor(config: MBDSocialPluginConfig) {
        super("mbd-social", [new MBDSocialService(config)]);
    }

    // This plugin is chain-agnostic, so it supports all chains
    supportsChain = () => true;
}

export function mbdSocial(config: MBDSocialPluginConfig) {
    return new MBDSocialPlugin(config);
}
