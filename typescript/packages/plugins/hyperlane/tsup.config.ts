import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    dts: {
        entry: "./src/index.ts",
        compilerOptions: {
            composite: false,
            declaration: true,
            emitDeclarationOnly: true
        }
    },
    sourcemap: true,
    clean: true,
    minify: true,
    splitting: false,
    treeshake: true,
    external: [
        "@goat-sdk/core",
        "@goat-sdk/wallet-evm",
        "@hyperlane-xyz/sdk",
        "zod"
    ]
});