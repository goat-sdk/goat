import { type Chain, PluginBase } from "@goat-sdk/core";
import type { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { createPublicClient, extractChain, http } from "viem";
import * as chains from "viem/chains";
import { type FeesPerGas, RECTA_NETWORK_BY_CHAIN_ID, RectaService } from "./recta.service";

export type RectaOptions = {
    /**
     * The source chain's fees per gas a compared route may commit to. Defaults to viem's estimate on the chain's
     * public RPC; pass your own to use your node.
     */
    estimateFeesPerGas?: (chainId: number) => Promise<FeesPerGas>;
};

function publicFeeEstimate(chainId: number): Promise<FeesPerGas> {
    const chain = extractChain({ chains: Object.values(chains), id: chainId as never });
    if (!chain) throw new Error(`No public RPC known for chain ${chainId}: pass estimateFeesPerGas`);
    return createPublicClient({ chain, transport: http() }).estimateFeesPerGas();
}

/**
 * Recta: a free second opinion on a cross-chain stablecoin transfer before it is sent. Only reads: it never signs
 * and never sends a transaction, and it needs no API key.
 */
export class RectaPlugin extends PluginBase<EVMWalletClient> {
    constructor(options: RectaOptions = {}) {
        super("recta", [new RectaService(options.estimateFeesPerGas ?? publicFeeEstimate)]);
    }

    supportsChain = (chain: Chain) => chain.type === "evm" && RECTA_NETWORK_BY_CHAIN_ID[chain.id] !== undefined;
}

export function recta(options: RectaOptions = {}) {
    return new RectaPlugin(options);
}
