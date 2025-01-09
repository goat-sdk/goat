import { defineConfig } from "tsup";

export default defineConfig({
    entry: [
        "src/index.ts",
        "src/etherscan.plugin.ts",
        "src/etherscan.service.ts",
        "src/parameters.ts",
        "src/request.ts",
    ],
    format: ["esm", "cjs"],
    dts: true,
    splitting: true,
    sourcemap: true,
    clean: true,
    target: "es2022",
});
