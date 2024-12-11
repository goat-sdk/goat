import type { z } from "zod";
import type { ZodTypeAny } from "zod";

function getTypeString(schema: z.ZodTypeAny): string {
    const typeName = schema._def?.typeName;

    switch (typeName) {
        case "ZodOptional":
            return getTypeString((schema as z.ZodOptional<ZodTypeAny>).unwrap());
        case "ZodString":
            return "string";
        case "ZodNumber":
            return "number";
        case "ZodBoolean":
            return "boolean";
        case "ZodArray":
            return "array";
        case "ZodObject":
            return "object";
        default:
            return "unknown";
    }
}

export function addParametersToDescription(description: string, schema: z.ZodTypeAny): string {
    let paramLines: string[] = [];

    if (schema._def?.typeName === "ZodObject") {
        const shape = schema._def.shape();
        if (shape) {
            paramLines = Object.entries<ZodTypeAny>(shape).map(([key, value]) => {
                const isOptional = value.isOptional();
                const paramDescription = value.description || "";
                const typeStr = getTypeString(value);
                return `- ${key}${isOptional ? " (optional)" : ""} (${typeStr}): ${paramDescription}`;
            });
        }
    }

    return `${description}\n${paramLines.join("\n")}`;
}

export function replaceToolPlaceholder(text: string, toolName: string): string {
    return text.replace(/\{\{tool\}\}/g, toolName);
}

export function parametersToJsonExample(parameters: z.ZodTypeAny): string {
    const exampleObject = generateExample(parameters);
    return JSON.stringify(exampleObject, null, 2);

    function generateExample(schema: z.ZodTypeAny): unknown {
        const typeName = schema._def?.typeName;

        switch (typeName) {
            case "ZodString":
                return "string";
            case "ZodNumber":
                return 0;
            case "ZodBoolean":
                return false;
            case "ZodArray":
                return [generateExample(schema._def.type)];
            case "ZodObject": {
                const shape = schema._def.shape();
                const obj: Record<string, unknown> = {};
                for (const [key, valueSchema] of Object.entries(shape)) {
                    obj[key] = generateExample(valueSchema as ZodTypeAny);
                }
                return obj;
            }
            case "ZodOptional":
            case "ZodNullable":
                return generateExample((schema as z.ZodOptional<ZodTypeAny>).unwrap());
            case "ZodUnion":
                return generateExample(schema._def.options[0]); // Use first option
            case "ZodLiteral":
                return schema._def.value;
            case "ZodEnum":
                return schema._def.values[0]; // Use first enum value
            case "ZodDefault":
                return generateExample(schema._def.innerType);
            default:
                return null;
        }
    }
}
