import type { z } from "zod";
import { deferredEVMCoreTools } from "./evm/tools";
import type { Plugin } from "./plugins/plugins";
import { deferredSolanaTools } from "./solana/tools";
import { replaceToolPlaceholder } from "./utils";
import type { AnyEVMWalletClient, ChainForWalletClient, WalletClient } from "./wallets";
import { isEVMChain, isEVMSmartWalletClient, isSolanaChain } from "./wallets";

// biome-ignore lint/suspicious/noExplicitAny: Tools can return any type
export type Tool<TResult = any> = {
    name: string;
    description: string;
    parameters: z.ZodSchema;
    method: (parameters: z.infer<z.ZodSchema>) => TResult | Promise<TResult>;
};

export type GetToolsParams<TWalletClient extends WalletClient> = {
    wallet: TWalletClient;
    plugins?: (Plugin<TWalletClient> | Plugin<WalletClient>)[];
    wordForTool?: string;
};

export async function getTools<TWalletClient extends WalletClient>({
    wallet,
    plugins = [],
    wordForTool,
}: GetToolsParams<TWalletClient>): Promise<Tool[]> {
    const chain = wallet.getChain() as ChainForWalletClient<TWalletClient>;

    const tools: DeferredTool<TWalletClient>[] = await getDeferredTools<TWalletClient>({
        chain,
        plugins,
        supportsSmartWallets: isEVMSmartWalletClient(wallet),
        wordForTool,
    });

    return tools.map((tool) => ({
        ...tool,
        method: (parameters) => tool.method(wallet, parameters),
    }));
}

/**
 * Deferred tools defer which wallet client to be passed to the method until the tool is called.
 */
// biome-ignore lint/suspicious/noExplicitAny: Tools can return any type
export type DeferredTool<TWalletClient extends WalletClient, TResult = any> = {
    name: string;
    description: string;
    parameters: z.ZodSchema;
    method: (walletClient: TWalletClient, parameters: z.infer<z.ZodSchema>) => TResult | Promise<TResult>;
};

export type GetDeferredToolsParams<TWalletClient extends WalletClient> = {
    chain: ChainForWalletClient<TWalletClient>;
    plugins?: (Plugin<TWalletClient> | Plugin<WalletClient>)[];
    supportsSmartWallets?: boolean;
    wordForTool?: string;
};

export async function getDeferredTools<TWalletClient extends AnyEVMWalletClient | WalletClient>({
    chain,
    supportsSmartWallets = false,
    wordForTool = "tool",
    plugins = [],
}: GetDeferredToolsParams<TWalletClient>): Promise<DeferredTool<TWalletClient>[]> {
    const tools: DeferredTool<TWalletClient>[] = [];

    if (isEVMChain(chain)) {
        // We know that TWalletClient is compatible with EVMWalletClient here
        tools.push(...(deferredEVMCoreTools as unknown as DeferredTool<TWalletClient>[]));
    } else if (isSolanaChain(chain)) {
        // We know that TWalletClient is compatible with SolanaWalletClient here
        tools.push(...(deferredSolanaTools as unknown as DeferredTool<TWalletClient>[]));
    } else {
        throw new Error(`Unsupported chain type: ${chain.type}`);
    }

    for (const plugin of plugins) {
        if (!plugin.supportsChain(chain)) {
            console.warn(`Plugin ${plugin.name} does not support chain ${chain.type}. Skipping.`);
            continue;
        }

        if (!plugin.supportsSmartWallets() && supportsSmartWallets) {
            console.warn(`Plugin ${plugin.name} does not support smart wallets. Skipping.`);
            continue;
        }

        const pluginTools = await plugin.getTools(chain);

        if (pluginTools.length === 0) {
            console.warn(`Plugin ${plugin.name} returned no tools. Skipping.`);
            continue;
        }

        tools.push(...pluginTools);
    }

    return tools.map((tool) => ({
        ...tool,
        description: replaceToolPlaceholder(tool.description, wordForTool),
    }));
}
