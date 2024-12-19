import { type Chain, PluginBase } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { IonicService } from "./ionic.service";

interface IonicPluginOptions {
  chainId: number;
  supportedTokens?: string[]; // Optional list of tokens to support
}

export class IonicPlugin extends PluginBase<EVMWalletClient> {
  constructor({ chainId, supportedTokens }: IonicPluginOptions) {
    super("ionic", [new IonicService(chainId, supportedTokens)]);
  }

  supportsChain = (chain: Chain) => chain.type === "evm";
}

export function ionic(options: IonicPluginOptions) {
  return new IonicPlugin(options);
} 