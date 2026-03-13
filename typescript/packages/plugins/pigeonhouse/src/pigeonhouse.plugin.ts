import { type Chain, PluginBase } from "@goat-sdk/core";
import { PigeonHouseService } from "./pigeonhouse.service";

export class PigeonHousePlugin extends PluginBase {
  constructor() {
    super("pigeonhouse", [new PigeonHouseService()]);
  }

  supportsChain = (chain: Chain) => chain.type === "solana";
}

export const pigeonhouse = () => new PigeonHousePlugin();
