import type { Chain, WalletClient } from "@goat-sdk/core";
import { type StoredToolMetadataMap, toolMetadataKey } from "../decorators/Tool";
import { type ToolBase, createTool } from "./ToolBase";

/**
 * Abstract base class for plugins that provide tools for wallet interactions.
 */
export abstract class PluginBase<TWalletClient extends WalletClient = WalletClient> {
    /**
     * Creates a new Plugin instance.
     * @param name - The name of the plugin
     * @param toolProviders - Array of class instances that provide tools
     */
    constructor(
        public readonly name: string,
        // biome-ignore lint/complexity/noBannedTypes: Object is the correct type, referring to instances of classes
        public readonly toolProviders: Object[],
    ) {}

    /**
     * Checks if the plugin supports a specific blockchain.
     * @param chain - The blockchain to check support for
     * @returns True if the chain is supported, false otherwise
     */
    abstract supportsChain(chain: Chain): boolean;

    /**
     * Checks if the plugin supports smart wallets.
     * @returns True if smart wallets are supported, false otherwise
     */
    abstract supportsSmartWallets(): boolean;

    /**
     * Retrieves the tools provided by the plugin.
     * @param wallet - The wallet client to use for tool execution
     * @returns An array of tools
     */
    getTools(wallet: TWalletClient): ToolBase[] | Promise<ToolBase[]> {
        const tools: ToolBase[] = [];

        for (const toolProvider of this.toolProviders) {
            const metadata = toolProvider.constructor[Symbol.metadata];
            const toolsMap = metadata?.[toolMetadataKey] as StoredToolMetadataMap | undefined;
            if (!toolsMap) {
                const constructorName = toolProvider.constructor.name;
                if (constructorName === "Function") {
                    console.warn(
                        "Detected a non-instance tool provider. Please ensure you're passing instances of your tool providers, by using `new MyToolProvider(..)`",
                    );
                } else {
                    console.warn(
                        `No tools found for ${constructorName}. Please ensure you're using the '@Tool' decorator to expose your tools.`,
                    );
                }
                continue;
            }

            for (const tool of toolsMap.values()) {
                if (typeof tool.target === "function") {
                    tools.push(
                        createTool(
                            {
                                name: tool.name,
                                description: tool.description,
                                parameters: tool.parameters,
                            },
                            tool.target.bind(toolProvider),
                        ),
                    );
                } else {
                    console.warn(
                        "Detected a non-function tool. Please ensure the '@Tool' decorator is being used on a class method",
                    );
                }
            }
        }

        return tools;
    }
}
