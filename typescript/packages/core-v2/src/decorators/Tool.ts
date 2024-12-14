import type { z } from "zod";
import type { ClassMethodDecorator } from "../types/ClassMethodDecorator";
import { snakeCase } from "../utils/snakeCase";

import "../symbol-polyfill";

/**
 * Parameters for the Tool decorator
 * @template TParameters - The Zod schema type for the tool parameters
 */
export type ToolDecoratorParams<TParameters extends z.ZodSchema = z.ZodSchema> = {
    /** The name of the tool */
    name?: string;
    /** A description of what the tool does */
    description: string;
    /** The Zod schema defining the tool's parameters */
    parameters: TParameters;
};

export type StoredToolMetadata = {
    name: string;
    description: string;
    parameters: z.ZodSchema;
    target: unknown;
};
export type StoredToolMetadataMap = Map<string, StoredToolMetadata>;

export const toolMetadataKey = Symbol("goat:tool");

/**
 * Decorator that marks a class method as a tool and stores its metadata
 * @param params - Configuration parameters for the tool
 * @returns A decorator function that can be applied to class methods
 *
 * @example
 * class MyToolService {
 *     \@Tool({
 *         description: "Adds two numbers",
 *         parameters: z.object({
 *             a: z.number(),
 *             b: z.number()
 *         })
 *     })
 *     add(a: number, b: number) {
 *         return a + b;
 *     }
 *}
 */
export function Tool(params: ToolDecoratorParams): ClassMethodDecorator {
    return (target, context) => {
        if (!context.metadata) {
            throw new Error("Decorator context metadata is not supported in this environment"); // TODO: Explain how to fix
        }
        const newToolMetadata: StoredToolMetadata = {
            name: params.name ?? snakeCase(target.name),
            description: params.description,
            parameters: params.parameters,
            target,
        };

        const toolMetadata = context.metadata[toolMetadataKey] as StoredToolMetadataMap | undefined;
        if (toolMetadata == null) {
            context.metadata[toolMetadataKey] = new Map<string, StoredToolMetadata>([[target.name, newToolMetadata]]);
        } else {
            toolMetadata.set(target.name, newToolMetadata);
        }

        return target;
    };
}
