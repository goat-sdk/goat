import { PluginBase } from "@goat-sdk/core";
import { TestPluginService } from "./test-plugin.service";

export class TestPluginPlugin extends PluginBase {
    constructor() {
        super("test-plugin", [new TestPluginService()]);
    }

    supportsChain = () => true;
}

export function testplugin() {
    return new TestPluginPlugin();
}
