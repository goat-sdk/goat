import { type Chain, PluginBase } from "@goat-sdk/core";
import type { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { AgentsvcService } from "./agentsvc.service";

// Chains on which agentsvc.io accepts USDC over x402 with an EVM wallet: Base, Polygon, Arbitrum
const SUPPORTED_CHAIN_IDS = [8453, 137, 42161];

export type AgentsvcPluginOptions = {
    /** Maximum price per call in USDC. The services cost 0.003 to 0.009 USDC. Default 0.05 */
    maxPaymentUsdc?: number;
};

export class AgentsvcPlugin extends PluginBase<EVMWalletClient> {
    constructor(options: AgentsvcPluginOptions = {}) {
        super("agentsvc", [new AgentsvcService(options.maxPaymentUsdc ?? 0.05)]);
    }

    supportsChain = (chain: Chain) => chain.type === "evm" && SUPPORTED_CHAIN_IDS.includes(chain.id);
}

/**
 * Pay-per-call safety checks from agentsvc.io (token pre-trade check, token verdict, scam message
 * check, prompt injection check), paid in USDC over x402 from the agent's wallet. No API key.
 */
export function agentsvc(options?: AgentsvcPluginOptions) {
    return new AgentsvcPlugin(options);
}
