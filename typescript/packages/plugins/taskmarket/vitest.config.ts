import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

// The @goat-sdk/core @Tool decorator introspects method parameters through
// Reflect design:paramtypes metadata. Vite's esbuild transform does not
// implement emitDecoratorMetadata, so tests compile through swc instead.
export default defineConfig({
    plugins: [
        swc.vite({
            module: { type: "es6" },
            jsc: {
                parser: { syntax: "typescript", decorators: true },
                transform: { legacyDecorator: true, decoratorMetadata: true },
            },
        }),
    ],
    test: {
        environment: "node",
    },
});
