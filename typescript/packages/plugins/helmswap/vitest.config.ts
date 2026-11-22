import ts from "typescript";
import { defineConfig } from "vitest/config";

// GOAT tools rely on decorator metadata, which esbuild does not emit, so test files are
// transpiled with the TypeScript compiler instead.
export default defineConfig({
    esbuild: false,
    plugins: [
        {
            name: "typescript-decorator-metadata",
            transform(code, id) {
                if (!id.endsWith(".ts") || id.includes("node_modules")) return;
                const output = ts.transpileModule(code, {
                    fileName: id,
                    compilerOptions: {
                        module: ts.ModuleKind.ESNext,
                        target: ts.ScriptTarget.ES2022,
                        experimentalDecorators: true,
                        emitDecoratorMetadata: true,
                        sourceMap: true,
                    },
                });
                return { code: output.outputText, map: output.sourceMapText };
            },
        },
    ],
});
