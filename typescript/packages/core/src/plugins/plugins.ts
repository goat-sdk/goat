import type { DeferredTool } from "../tools";
import type { Chain, WalletClient } from "../wallets";
import type { ChainForWalletClient } from "../wallets/utils";
/**
 * Plugin interface that can be chain-specific or chain-agnostic.
 * Defaults to WalletClient for chain-agnostic plugins.
 *
 * @param TWalletClient - The type of wallet client to support. Defaults to WalletClient for chain-agnostic plugins.
 * @param name - The name of the plugin.
 * @param supportsChain - A function that returns true if the plugin supports the given chain.
 * @param supportsSmartWallets - A function that returns true if the plugin supports smart wallets.
 * @param getTools - A function that returns the tools provided by the plugin.
 */
export interface Plugin<TWalletClient extends WalletClient = WalletClient> {
    name: string;
    supportsChain: (chain: Chain) => boolean;
    supportsSmartWallets: () => boolean;
    getTools: (chain: ChainForWalletClient<TWalletClient>) => Promise<DeferredTool<TWalletClient>[]>;
}
