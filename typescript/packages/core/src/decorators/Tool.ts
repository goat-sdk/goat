import type { z } from "zod";
import { snakeCase } from "../utils/snakeCase";

import "reflect-metadata";
import { type ToolBase, createTool } from "../classes";

/**
 * Parameters for the Tool decorator
 * @template TParameters - The Zod schema type for the tool parameters
 */
export type ToolDecoratorParams = {
    /**
     * The name of the tool
     * @default snakeCase(methodName)
     */
    name?: string;
    /** A description of what the tool does */
    description: string;
};

export type StoredToolMetadataMap = Map<string, ToolBase>;

export const toolMetadataKey = Symbol("goat:tool");

/**
 * Decorator that marks a class method as a tool accessible to the LLM
 * @param params - Configuration parameters for the tool
 * @returns A decorator function that can be applied to class methods
 *
 * @example
 * class MyToolService {
 *     \@Tool({
 *         description: "Adds two numbers",
 *     })
 *     add({a, b}: AddParameters) {
 *         return a + b;
 *     }
 *}
 */
export function Tool(params: ToolDecoratorParams) {
    // biome-ignore lint/complexity/noBannedTypes: Object is the correct type for a class method
    return (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
        const parametersSchema = validateMethodParameters(target, propertyKey, descriptor);

        const newTool = createTool(
            {
                name: params.name ?? snakeCase(propertyKey),
                description: params.description,
                parameters: parametersSchema,
            },
            (params) => descriptor.value(params),
        );

        const existingTools: StoredToolMetadataMap =
            Reflect.getMetadata(toolMetadataKey, target.constructor) || new Map();

        existingTools.set(propertyKey, newTool);

        Reflect.defineMetadata(toolMetadataKey, existingTools, target.constructor);
        return target;
    };
}

// biome-ignore lint/complexity/noBannedTypes: Object is the correct type for a class method
function validateMethodParameters(target: Object, propertyKey: string, descriptor: PropertyDescriptor): z.ZodSchema {
    const className = target instanceof Object ? target.constructor.name : undefined;
    const logPrefix = `Method '${propertyKey}'${className ? ` on class '${className}'` : ""}`;
    const explainer =
        "Tool methods must have a single parameter that is a Zod schema class created with the createToolParameters function.";

    const methodParameters = Reflect.getMetadata("design:paramtypes", target, propertyKey);

    if (methodParameters == null) {
        throw new Error(`Failed to get parameters for ${logPrefix}.`);
    }
    if (methodParameters.length === 0) {
        throw new Error(`${logPrefix} has no parameters. ${explainer}`);
    }
    if (methodParameters.length > 1) {
        throw new Error(`${logPrefix} has ${methodParameters.length} parameters. ${explainer}`);
    }

    const firstParameter = methodParameters[0];

    const zodSchema = firstParameter.prototype.constructor.schema as z.ZodSchema | undefined;
    if (zodSchema == null) {
        throw new Error(
            `${logPrefix} has a parameter that is not a Zod schema.\n\n1.) ${explainer}\n\n2.) Ensure that you are not using 'import type' for the parameters.`,
        );
    }

    return zodSchema;
}
