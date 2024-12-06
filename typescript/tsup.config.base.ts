import type { Options } from "tsup";

export const treeShakableConfig: Options = {
    splitting: true,
    clean: true,
    format: ["esm", "cjs"],
    bundle: true,
    skipNodeModulesBundle: true,
    watch: false,
    shims: true,
    entry: ["src/**/*.(ts|tsx)", "!src/**/*.test.(ts|tsx)"],
    outDir: "dist",
    dts: true,
    sourcemap: true,
};
