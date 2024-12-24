import { type Chain, PluginBase } from "@goat-sdk/core";
import { TeeService } from "./tee.service";
import { TEEMode } from "./tee.types";

interface TeePluginOptions {
    teeMode: TEEMode;
    teeSecretSalt: string;
}

export class TeePlugin extends PluginBase {
    constructor({ teeMode, teeSecretSalt }: TeePluginOptions) {
        super("tee", [new TeeService(teeMode, teeSecretSalt)]);
    }
    // TEE supports all chains
    supportsChain = (chain: Chain) => true;
}

export function tee(options: TeePluginOptions) {
    return new TeePlugin(options);
}