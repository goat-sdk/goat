import { z } from "zod";
import { PluginBase } from "../../classes/PluginBase";
import { createToolParameters } from "../../utils/createToolParameters";

// Utility to create parameters class
export function createMockParameters(schema: z.ZodTypeAny) {
    return class extends createToolParameters(schema) {};
}

// Create a mock plugin with the given service
export function createMockPlugin(name: string, service: object) {
    class MockPlugin extends PluginBase {
        supportsChain() {
            return true;
        }
    }

    return new MockPlugin(name, [service]);
}
