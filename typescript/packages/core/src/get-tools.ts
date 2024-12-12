import { getCoreTools } from "./core-tools";
import type { Plugin } from "./plugins";
import type { Tool } from "./tool";
import { replaceToolPlaceholder } from "./utils";
import { type WalletClient, isEVMSmartWalletClient } from "./wallets";

export type GetToolsParams<TWalletClient extends WalletClient> = {
    wallet: TWalletClient;
    plugins?: (Plugin<TWalletClient> | Plugin<WalletClient>)[];
    options?: {
        wordForTool?: string;
    };
};

export async function getTools<TWalletClient extends WalletClient>({
    wallet,
    plugins = [],
    options,
}: GetToolsParams<TWalletClient>): Promise<Tool[]> {
    const tools: Tool[] = [];

    tools.push(...getCoreTools(wallet));

    const chain = wallet.getChain();

    for (const plugin of plugins) {
        if (!plugin.supportsChain(chain)) {
            console.warn(
                `Plugin ${plugin.name} does not support ${chain.type}${
                    chain.id ? ` chain id ${chain.id}` : ""
                }. Skipping.`,
            );
            continue;
        }

        if (!plugin.supportsSmartWallets() && isEVMSmartWalletClient(wallet)) {
            console.warn(`Plugin ${plugin.name} does not support smart wallets. Skipping.`);
            continue;
        }

        const pluginTools = await plugin.getTools(wallet);

        if (pluginTools.length === 0) {
            console.warn(`Plugin ${plugin.name} returned no tools. Skipping.`);
            continue;
        }

        tools.push(...pluginTools);
    }

    const wordForTool = options?.wordForTool ?? "tool";

    return tools.map((tool) => ({
        ...tool,
        description: replaceToolPlaceholder(tool.description, wordForTool),
    }));
}
