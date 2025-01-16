import { defineConfig } from "tsup";

export default defineConfig({
    entry: [
        "src/**/*.ts",
        "!src/example.ts", // Exclude example.ts
    ],
    format: ["cjs", "esm"],
    dts: true,
    sourcemap: true,
    clean: true,
});
