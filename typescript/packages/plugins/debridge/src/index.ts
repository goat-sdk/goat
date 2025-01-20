/**
 * @fileoverview DeBridge Plugin for cross-chain token swaps and bridging
 * This plugin enables seamless token transfers between different blockchain networks
 * using the DeBridge protocol.
 */

import { type Chain, PluginBase, WalletClientBase } from "@goat-sdk/core";
import { arbitrum, avalanche, base, bsc, gnosis, linea, mainnet, optimism, polygon } from "viem/chains";
import { DebridgeTools } from "./tools";

/**
 * Configuration options for the DeBridge plugin
 * @interface DebridgeOptions
 * @property {string} [baseUrl] - Optional custom base URL for DeBridge API endpoints
 */
export type DebridgeOptions = {
    baseUrl?: string;
};

/**
 * Default base URL for DeBridge API endpoints
 * @constant
 */
const DEFAULT_BASE_URL = "https://deswap.debridge.finance/v1.0";

/**
 * List of EVM chains currently supported by this plugin
 * Note: This is a subset of all chains supported by DeBridge.
 * For the complete list of supported chains, see:
 * https://dln.debridge.finance/v1.0/supported-chains-info
 *
 * @todo Implement dynamic chain support by fetching the complete list
 * from DeBridge's API endpoint. This will ensure we always support
 * the latest chains added to the protocol.
 *
 * @constant
 */
export const SUPPORTED_CHAINS = [
    mainnet, // 1
    optimism, // 10
    bsc, // 56
    polygon, // 137
    base, // 8453
    arbitrum, // 42161
    avalanche, // 43114
    linea, // 59144
    gnosis, // 100
] as const;

/**
 * DeBridge Plugin class for handling cross-chain token operations
 * @extends PluginBase
 */
export class Debridge extends PluginBase<WalletClientBase> {
    /**
     * Creates a new instance of the DeBridge plugin
     * @param {DebridgeOptions} options - Configuration options
     */
    constructor(options: DebridgeOptions = {}) {
        const baseUrl = options.baseUrl || DEFAULT_BASE_URL;
        super("debridge", [new DebridgeTools({ baseUrl })]);
    }

    /**
     * Checks if a given blockchain is supported by DeBridge
     * Note: This currently only checks against our static list of chains.
     * Once dynamic chain support is implemented, this will check against
     * the complete list from DeBridge's API.
     *
     * @param {Chain} chain - The blockchain to check for support
     * @returns {boolean} True if the chain is supported, false otherwise
     */
    supportsChain = (chain: Chain) => chain.type === "evm" && SUPPORTED_CHAINS.some((c) => c.id === chain.id);
}

/**
 * Factory function to create a new DeBridge plugin instance
 * @param {DebridgeOptions} options - Configuration options
 * @returns {Debridge} A new DeBridge plugin instance
 * @example
 * ```typescript
 * const debridgePlugin = debridge({ baseUrl: 'https://custom.api.url' });
 * ```
 */
export const debridge = (options: DebridgeOptions = {}) => new Debridge(options);
