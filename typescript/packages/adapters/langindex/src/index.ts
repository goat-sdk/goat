import {
    type GetToolsParams,
    type Tool,
    type WalletClient,
    addParametersToDescription,
    getTools,
} from "@goat-sdk/core";

import { FunctionTool } from "llamaindex";
import type { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import type { JSONSchemaType } from "ajv";

export type GetOnChainToolsParams<TWalletClient extends WalletClient> = GetToolsParams<TWalletClient>;

export async function getOnChainTools<TWalletClient extends WalletClient>({
    wallet,
    plugins,
}: GetOnChainToolsParams<TWalletClient>) {
    const tools: Tool[] = await getTools({ wallet, plugins });

    return tools.map(
        (t) =>
            new FunctionTool(
                async (arg: z.output<typeof t.parameters>) => {
                    return await t.method(arg);
                },
                {
                    name: t.name,
                    description: addParametersToDescription(t.description, t.parameters),
                    parameters: zodToJsonSchema(t.parameters, { target: "jsonSchema7" }) as JSONSchemaType<
                        z.output<typeof t.parameters>
                    >,
                },
            ),
    );
}
