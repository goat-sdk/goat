import { describe, expect, it } from "vitest";
import { z } from "zod";
import { addParametersToDescription, parametersToJsonExample, replaceToolPlaceholder } from "./utils";

// Note: getTypeString is an internal helper, indirectly tested by addParametersToDescription
// and parametersToJsonExample. However, we can still test it directly by importing if needed.
// If you want to test it directly, uncomment and export it in your utils file.
// import { getTypeString } from "./utils";

describe("addParametersToDescription", () => {
    it("should append parameter descriptions for an object schema", () => {
        const schema = z.object({
            address: z.string().describe("The address parameter"),
            tokenId: z.number().optional().describe("Optional tokenId parameter"),
            active: z.boolean().describe("Is active"),
        });

        const description = "Token description:";
        const result = addParametersToDescription(description, schema);

        expect(result).toContain("- address (string): The address parameter");
        expect(result).toContain("- tokenId (optional) (number): Optional tokenId parameter");
        expect(result).toContain("- active (boolean): Is active");
    });

    it("should return the original description if schema is not an object", () => {
        const schema = z.string().describe("Just a string");
        const description = "A simple description";
        const result = addParametersToDescription(description, schema);

        // Since it's not a ZodObject, it should just return the original description with a newline.
        expect(result).toBe("A simple description\n");
    });

    it("should handle an empty ZodObject correctly", () => {
        const schema = z.object({});
        const description = "An empty object:";
        const result = addParametersToDescription(description, schema);

        // No parameters
        expect(result).toBe("An empty object:\n");
    });
});

describe("replaceToolPlaceholder", () => {
    it("should replace all instances of {{tool}} with the given tool name", () => {
        const text = "This {{tool}} will ...";
        const toolName = "action";
        const replaced = replaceToolPlaceholder(text, toolName);

        expect(replaced).toBe("This action will ...");
    });

    it("should return the original text if there are no placeholders", () => {
        const text = "No placeholders here";
        const replaced = replaceToolPlaceholder(text, "ToolName");

        expect(replaced).toBe("No placeholders here");
    });
});

describe("parametersToJsonExample", () => {
    it("should generate a JSON example from a complex schema", () => {
        const schema = z.object({
            address: z.string().describe("Address"),
            tokenId: z.number().describe("Token Id"),
            active: z.boolean().describe("active"),
            tags: z.array(z.string()).describe("Tags"),
            nested: z
                .object({
                    foo: z.string().describe("Nested foo"),
                })
                .describe("Nested object"),
        });

        const result = parametersToJsonExample(schema);
        const parsed = JSON.parse(result);

        expect(parsed).toEqual({
            address: "string",
            tokenId: 0,
            active: false,
            tags: ["string"],
            nested: {
                foo: "string",
            },
        });
    });

    it("should handle optional fields by giving their type example", () => {
        const schema = z.object({
            address: z.string(),
            tokenId: z.number().optional(),
        });

        const result = parametersToJsonExample(schema);
        const parsed = JSON.parse(result);

        // Even if optional, we produce a sample value
        expect(parsed).toEqual({
            address: "string",
            tokenId: 0,
        });
    });

    it("should handle union types by using the first option", () => {
        const schema = z.union([z.string(), z.number()]);
        const result = parametersToJsonExample(schema);
        const parsed = JSON.parse(result);

        // First option is a string
        expect(parsed).toBe("string");
    });

    it("should handle literal values", () => {
        const schema = z.literal("fixed");
        const result = parametersToJsonExample(schema);
        const parsed = JSON.parse(result);

        expect(parsed).toBe("fixed");
    });

    it("should handle enums by using the first enum value", () => {
        const schema = z.enum(["RED", "GREEN", "BLUE"]);
        const result = parametersToJsonExample(schema);
        const parsed = JSON.parse(result);

        expect(parsed).toBe("RED");
    });

    it("should return null for unknown types", () => {
        // Construct a schema that will return default case
        // We'll simulate by casting or creating a custom Zod type
        // biome-ignore lint/suspicious/noExplicitAny: Just testing
        const UnknownSchema = z.string().transform((val) => val)._def as any;
        UnknownSchema.typeName = "ZodUnknown"; // Simulate unknown type
        const schema = { ...z.string(), _def: UnknownSchema } as z.ZodTypeAny;

        const result = parametersToJsonExample(schema);
        const parsed = JSON.parse(result);

        expect(parsed).toBeNull();
    });
});
