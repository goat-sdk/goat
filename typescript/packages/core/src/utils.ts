import type { ZodTypeAny } from "zod";
import { z } from "zod";

export function addParametersToDescription(description: string, schema: z.ZodTypeAny): string {
    let paramLines: string[] = [];

    if (schema instanceof z.ZodObject) {
        const shape = schema.shape;
        paramLines = Object.entries<ZodTypeAny>(shape).map(([key, value]) => {
            const isOptional = value.isOptional();
            const paramDescription = value.description || "";
            const typeStr = getTypeString(value);

            return `- ${key}${isOptional ? " (optional)" : ""} (${typeStr}): ${paramDescription}`;
        });
    } else {
        const isOptional = schema.isOptional();
        const paramDescription = schema.description || "";
        const typeStr = getTypeString(schema);

        paramLines.push(`- ${isOptional ? "(optional) " : ""}(${typeStr}): ${paramDescription}`);
    }

    return `${description}\n${paramLines.join("\n")}`;
}

function getTypeString(schema: z.ZodTypeAny): string {
    if (schema instanceof z.ZodOptional) {
        // Recursively get the type of the inner schema
        return getTypeString(schema.unwrap());
    }
    if (schema instanceof z.ZodString) {
        return "string";
    }
    if (schema instanceof z.ZodNumber) {
        return "number";
    }
    if (schema instanceof z.ZodBoolean) {
        return "boolean";
    }
    if (schema instanceof z.ZodArray) {
        return "array";
    }
    if (schema instanceof z.ZodObject) {
        return "object";
    }
    return "unknown";
}

export function replaceToolPlaceholder(template: string, wordForTool = "tool"): string {
    const placeholderRegex = /\{\{\s*tool\s*\}\}/g;
    return template.replace(placeholderRegex, wordForTool);
}

export function parametersToJsonExample(parameters: z.ZodTypeAny): string {
    const exampleObject = generateExample(parameters);
    return JSON.stringify(exampleObject, null, 2);

    function generateExample(schema: z.ZodTypeAny): unknown {
        if (schema instanceof z.ZodString) {
            return "string";
        }
        if (schema instanceof z.ZodNumber) {
            return 0;
        }
        if (schema instanceof z.ZodBoolean) {
            return false;
        }
        if (schema instanceof z.ZodArray) {
            const elementSchema = schema._def.type;
            return [generateExample(elementSchema)];
        }
        if (schema instanceof z.ZodObject) {
            const shape = schema._def.shape();
            const obj: Record<string, unknown> = {};
            for (const [key, valueSchema] of Object.entries(shape)) {
                obj[key] = generateExample(valueSchema as ZodTypeAny);
            }
            return obj;
        }
        if (schema instanceof z.ZodOptional || schema instanceof z.ZodNullable) {
            const innerSchema = schema.unwrap();
            return generateExample(innerSchema);
        }
        if (schema instanceof z.ZodUnion) {
            const options = schema._def.options;
            return generateExample(options[0]); // Use the first option as an example
        }
        if (schema instanceof z.ZodLiteral) {
            return schema._def.value;
        }
        if (schema instanceof z.ZodEnum) {
            return schema._def.values[0]; // Use the first enum value as an example
        }
        if (schema instanceof z.ZodDefault) {
            return generateExample(schema._def.innerType);
        }
        return null; // Default value if type is unrecognized
    }
}
