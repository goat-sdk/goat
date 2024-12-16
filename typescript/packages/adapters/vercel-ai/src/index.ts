import { type GetToolsParams, type Tool, type WalletClient, getTools } from "@goat-sdk/core";

import { type CoreTool, tool } from "ai";
import type { z } from "zod";

export type GetOnChainToolsParams<TWalletClient extends WalletClient> = GetToolsParams<TWalletClient>;

export async function getOnChainTools<TWalletClient extends WalletClient>({
    wallet,
    plugins,
}: GetOnChainToolsParams<TWalletClient>) {
    const tools: Tool[] = await getTools<TWalletClient>({
        wallet,
        plugins,
    });

    const aiTools: { [key: string]: CoreTool } = {};

    for (const t of tools) {
        aiTools[t.name] = tool({
            description: t.description,
            parameters: t.parameters,
            execute: async (arg: z.output<typeof t.parameters>) => {
                return await t.method(arg);
            },
        });
    }

    return aiTools;
}
