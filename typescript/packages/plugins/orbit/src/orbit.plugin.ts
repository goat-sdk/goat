import { PluginBase, type Chain } from "@goat-sdk/core";
import { OrbitService } from "./orbit.service";

const DEFAULT_RPC_URL = "https://api.mainnet-beta.solana.com";

export interface OrbitPluginConfig {
  /**
   * Solana RPC endpoint URL.
   * Defaults to the public mainnet-beta endpoint.
   * Use a private RPC (e.g. Helius, QuickNode) in production.
   */
  rpcUrl?: string;
}

export class OrbitPlugin extends PluginBase {
  constructor(config: OrbitPluginConfig = {}) {
    const rpcUrl = config.rpcUrl ?? DEFAULT_RPC_URL;
    super("orbit", [new OrbitService(rpcUrl)]);
  }

  /** Orbit Finance is Solana-only */
  supportsChain(chain: Chain): boolean {
    return chain.type === "solana";
  }
}

/**
 * Factory function -- preferred entry point.
 *
 * @example
 * import { orbit } from "@goat-sdk/plugin-orbit";
 * const orbitPlugin = orbit({ rpcUrl: "https://rpc.helius.xyz/?api-key=..." });
 */
export function orbit(config?: OrbitPluginConfig): OrbitPlugin {
  return new OrbitPlugin(config);
}
