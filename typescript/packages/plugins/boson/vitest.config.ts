import path from "node:path";
import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [
        swc.vite({
            module: { type: "es6" },
            jsc: {
                parser: { syntax: "typescript", decorators: true },
                transform: { legacyDecorator: true, decoratorMetadata: true },
                target: "es2022",
            },
        }),
    ],
    resolve: {
        alias: {
            "@goat-sdk/core": path.resolve(__dirname, "node_modules/@goat-sdk/core/src/index.ts"),
            "@goat-sdk/wallet-evm": path.resolve(__dirname, "node_modules/@goat-sdk/wallet-evm/src/index.ts"),
        },
    },
    test: {
        globals: false,
    },
});
