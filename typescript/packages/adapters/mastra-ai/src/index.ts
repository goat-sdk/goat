import { type GetToolsParams, type ToolBase, type WalletClientBase, getTools } from "@goat-sdk/core";
import type { Tool } from "@mastra/core";
import { createTool } from "@mastra/core";

export type GetOnChainToolsParams<TWalletClient extends WalletClientBase> = GetToolsParams<TWalletClient>;

export async function getOnChainTools<TWalletClient extends WalletClientBase>({
    wallet,
    plugins,
}: GetOnChainToolsParams<TWalletClient>) {
    const tools: ToolBase[] = await getTools<TWalletClient>({
        wallet,
        plugins,
    });

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const mastraTools: { [key: string]: Tool<string, any, any> } = {};

    for (const t of tools) {
        mastraTools[t.name] = createTool({
            id: t.name,
            description: t.description,
            inputSchema: t.parameters,
            execute: async ({ context }) => {
                // Validate input against original schema
                const validatedInput = await t.parameters.parseAsync(context);
                return await t.execute(validatedInput);
            },
        });
    }

    return mastraTools;
}
