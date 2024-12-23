import { defineConfig } from "tsup";
import { treeShakableConfig } from "../../../tsup.config.base";

export default defineConfig({
  ...treeShakableConfig,
  
  entry: [
    "src/index.ts",
    "src/ionic.plugin.ts",
    "src/ionic.service.ts",
    "src/types.ts",
    "src/abi.ts"
  ],
  
  dts: true,

  splitting: true,
 
  sourcemap: true,

  external: [
    "@goat-sdk/core",
    "@goat-sdk/wallet-evm",
    "viem",
    "zod"
  ],
  
});