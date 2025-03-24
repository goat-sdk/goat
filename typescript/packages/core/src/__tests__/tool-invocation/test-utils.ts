import { z } from "zod";
import { PluginBase } from "../../classes/PluginBase";
import { createToolParameters } from "../../utils/createToolParameters";

// Utility to create parameters class with validation
export function createMockParameters(schema: z.ZodTypeAny) {
    return class extends createToolParameters(schema) {
        static schema = schema;
        
        constructor(data?: any) {
            super();
            if (data) {
                const parsed = schema.safeParse(data);
                if (!parsed.success) {
                    throw new Error(`Invalid parameters: ${parsed.error}`);
                }
                Object.assign(this, parsed.data);
            }
        }
    };
}

// Create a mock plugin with the given service
export function createMockPlugin(name: string, service: object) {
    class MockPlugin extends PluginBase {
        constructor(name: string, services: object[]) {
            super(name, services);
        }

        supportsChain() {
            return true;
        }

        async execute(methodName: string, params: any) {
            // Get the tool from the parent class
            const tools = await this.getTools(null);
            const tool = tools.find(t => t.name === methodName);
            if (!tool) {
                throw new Error(`Tool ${methodName} not found`);
            }

            // Validate parameters using the tool's schema if available
            if (tool.parameters) {
                try {
                    // Try to validate parameters
                    const result = tool.parameters.safeParse(params);
                    if (!result.success) {
                        throw new Error(`Invalid parameters: ${result.error}`);
                    }
                } catch (error) {
                    console.warn(`Parameter validation failed: ${error}`);
                }
            }

            // Call the tool with the validated parameters
            // The wallet is automatically injected by the Tool decorator
            return await tool.execute(params);
        }
    }

    return new MockPlugin(name, [service]);
}
