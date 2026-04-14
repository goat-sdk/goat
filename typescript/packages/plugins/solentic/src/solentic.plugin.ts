import { type Chain, PluginBase } from "@goat-sdk/core";
import { SolenticService } from "./solentic.service";

export interface SolenticPluginOptions {
  /**
   * Base URL of the Solentic API.
   * Defaults to "https://solentic.theblueprint.xyz"
   */
  baseUrl?: string;
}

export class SolenticPlugin extends PluginBase {
  constructor(options?: SolenticPluginOptions) {
    super("solentic", [new SolenticService(options?.baseUrl)]);
  }

  supportsChain = (chain: Chain) => chain.type === "solana";
}

/**
 * Create a Solentic plugin instance for GOAT.
 *
 * @example
 * ```ts
 * import { solentic } from "@goat-sdk/plugin-solentic";
 *
 * const tools = await getOnChainTools({
 *   wallet: solanaWallet,
 *   plugins: [solentic()],
 * });
 * ```
 */
export function solentic(options?: SolenticPluginOptions) {
  return new SolenticPlugin(options);
}
