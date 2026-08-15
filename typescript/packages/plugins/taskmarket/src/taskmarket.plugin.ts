import { PluginBase } from "@goat-sdk/core";
import { TaskmarketAPI } from "./api";
import { TaskmarketService } from "./taskmarket.service";

export class TaskmarketPlugin extends PluginBase {
    constructor() {
        super("taskmarket", [new TaskmarketService(new TaskmarketAPI())]);
    }

    supportsChain = () => true;
}

export function taskmarket() {
    return new TaskmarketPlugin();
}
