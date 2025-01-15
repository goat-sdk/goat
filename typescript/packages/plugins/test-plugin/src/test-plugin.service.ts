import { Tool } from "@goat-sdk/core";
import type { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { ExampleParameters } from "./parameters";

export class TestPluginService {
    @Tool({
        name: "test_plugin_example",
        description: "An example method in TestPluginService",
    })
    async doSomething(walletClient: EVMWalletClient, parameters: ExampleParameters) {
        // Implementation goes here
        return "Hello from TestPluginService!";
    }
}
