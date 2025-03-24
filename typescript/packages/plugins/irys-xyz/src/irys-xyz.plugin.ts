import { PluginBase } from "@goat-sdk/core";
import { IrysXyzService } from "./irys-xyz.service";

export class IrysXyzPlugin extends PluginBase {
    constructor() {
        super("irys-xyz", [new IrysXyzService()]);
    }

    supportsChain = () => true;
}

export function irysxyz() {
    return new IrysXyzPlugin();
}
