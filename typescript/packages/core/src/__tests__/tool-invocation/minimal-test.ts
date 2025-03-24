import "reflect-metadata";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { WalletClientBase } from "../../classes";
import { Tool, toolMetadataKey } from "../../decorators/Tool";
import { createToolParameters } from "../../utils/createToolParameters";
import { mockWalletClient } from "./mock-utils";

// Create parameter class with static schema using createToolParameters
class TestParams extends createToolParameters(
    z.object({
        value: z.string().describe("Test value"),
    }),
) {
    static schema = z.object({
        value: z.string().describe("Test value"),
    });
}

// Create service with tool method
class TestService {
    @Tool({
        description: "Test tool",
    })
    async testMethod(wallet: WalletClientBase, params: TestParams) {
        return { success: true };
    }
}

describe("Minimal Tool decorator test", () => {
    it("should correctly detect parameters", () => {
        const service = new TestService();
        expect(service.testMethod).toBeDefined();

        // Access the metadata through the class constructor
        const toolsMetadata = Reflect.getMetadata(toolMetadataKey, TestService);
        expect(toolsMetadata).toBeDefined();
        expect(toolsMetadata.has("testMethod")).toBe(true);

        const metadata = toolsMetadata.get("testMethod");
        expect(metadata.name).toBe("test_method");
        expect(metadata.description).toBe("Test tool");
    });

    it("should execute the tool method with correct parameters", async () => {
        const service = new TestService();
        const wallet = mockWalletClient();
        const params = { value: "test" };

        const result = await service.testMethod(wallet, params as TestParams);
        expect(result).toEqual({ success: true });
    });
});
