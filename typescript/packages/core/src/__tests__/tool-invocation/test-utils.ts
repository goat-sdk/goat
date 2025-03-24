import { z } from "zod";
import { Tool } from "../../decorators/Tool";
import { createToolParameters } from "../../utils/createToolParameters";
import { PluginBase } from "../../classes/PluginBase";
import { MockWalletClient } from "./mock-utils";

// Utility to create parameters class
export function createMockParameters(schema: z.ZodTypeAny) {
    return class extends createToolParameters(schema) {};
}

// Create a mock plugin with the given service
export function createMockPlugin(name: string, service: any) {
    class MockPlugin extends PluginBase {
        supportsChain() {
            return true;
        }
    }

    return new MockPlugin(name, [service]);
}
