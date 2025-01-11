import { AdapterBase, ToolBase } from "@goat-sdk/core";
import { ExecutableGameFunctionResponse, ExecutableGameFunctionStatus, GameFunction } from "@virtuals-protocol/game";
import type { JSONSchemaType } from "ajv";
import { zodToJsonSchema } from "zod-to-json-schema";

type VirtualsGameAdaptedTools = GameFunction<
    {
        name: string;
        description: string;
    }[]
>;

export class VirtualsGameAdapter extends AdapterBase<VirtualsGameAdaptedTools> {
    protected adaptTool(tool: ToolBase): VirtualsGameAdaptedTools {
        // biome-ignore lint/suspicious/noExplicitAny: Fix types later
        const schema = zodToJsonSchema(tool.parameters as any, {
            target: "jsonSchema7",
        }) as JSONSchemaType<typeof tool.parameters>;

        const properties = Object.keys(schema.properties);

        const args = properties.map((property) => ({
            name: property,
            description: schema.properties[property].description ?? "",
        }));

        return new GameFunction({
            name: tool.name,
            description: tool.description,
            args: args,
            executable: async (args) => {
                try {
                    const result = await tool.execute(args);
                    return new ExecutableGameFunctionResponse(
                        ExecutableGameFunctionStatus.Done,
                        JSON.stringify(result),
                    );
                } catch (e) {
                    return new ExecutableGameFunctionResponse(
                        ExecutableGameFunctionStatus.Failed,
                        `Failed to execute tool: ${e}`,
                    );
                }
            },
        });
    }
}
