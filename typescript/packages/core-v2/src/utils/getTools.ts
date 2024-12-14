import type { ToolBase } from "../classes/ToolBase";
import type { PluginBase } from "../classes/PluginBase";

import { isEVMSmartWalletClient, type WalletClient } from "@goat-sdk/core";

export type GetToolsParams<TWalletClient extends WalletClient> = {
    wallet: TWalletClient;
    plugins?: (PluginBase<TWalletClient> | PluginBase<WalletClient>)[];
};
export async function getTools<TWalletClient extends WalletClient>({
    wallet,
    plugins = [],
}: GetToolsParams<TWalletClient>) {
    const tools: ToolBase[] = [];

    const chain = wallet.getChain();

    for (const plugin of plugins) {
        if (!plugin.supportsChain(chain)) {
            console.warn(
                `Plugin ${plugin.name} does not support ${chain.type}${
                    chain.id ? ` chain id ${chain.id}` : ""
                }. Skipping.`,
            );
        }

        if (!plugin.supportsSmartWallets() && isEVMSmartWalletClient(wallet)) {
            console.warn(`Plugin ${plugin.name} does not support smart wallets. Skipping.`);
            continue;
        }

        const pluginTools = await plugin.getTools(wallet);

        tools.push(...pluginTools);
    }

    return tools;
}
