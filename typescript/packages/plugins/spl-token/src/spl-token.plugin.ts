import { type Chain, PluginBase } from "@goat-sdk/core";
import { SplTokenService } from "./spl-token.service";
import type { SplTokenPluginCtorParams } from "./types/SplTokenPluginCtorParams";

export class SplTokenPlugin extends PluginBase {
    constructor(params?: SplTokenPluginCtorParams) {
        super("splToken", [new SplTokenService(params)]);
    }

    supportsChain = (chain: Chain) => chain.type === "solana";
}

export const splToken = (params?: SplTokenPluginCtorParams) => new SplTokenPlugin(params);
