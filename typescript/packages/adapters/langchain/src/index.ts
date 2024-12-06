import {
    type GetToolsParams,
    type Tool,
    type WalletClient,
    addParametersToDescription,
    getTools,
} from "@goat-sdk/core";

import { tool } from "@langchain/core/tools";
import type { z } from "zod";

export type GetOnChainToolsParams<TWalletClient extends WalletClient> = GetToolsParams<TWalletClient>;

export async function getOnChainTools<TWalletClient extends WalletClient>({
    wallet,
    plugins,
}: GetOnChainToolsParams<TWalletClient>) {
    const tools: Tool[] = await getTools({ wallet, plugins });

    return tools.map((t) =>
        tool(
            async (arg: z.output<typeof t.parameters>) => {
                return await t.method(arg);
            },
            {
                name: t.name,
                description: addParametersToDescription(t.description, t.parameters),
                schema: t.parameters,
            },
        ),
    );
}
