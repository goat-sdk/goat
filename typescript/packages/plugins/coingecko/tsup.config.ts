import { defineConfig } from "tsup";
import { treeShakableConfig } from "../../../tsup.config.base";

// Check if we're building with eval code
const includeEval = process.env.INCLUDE_EVAL === "true";

export default defineConfig({
    ...treeShakableConfig,
    // Override entry points to optionally include eval code
    entry: includeEval
        ? ["src/**/*.(ts|tsx)", "!src/**/*.test.(ts|tsx)"]
        : ["src/**/*.(ts|tsx)", "!src/**/*.test.(ts|tsx)", "!src/eval/**/*"],
    // Create a separate eval.js file if including eval code
    ...(includeEval && {
        // Create a standalone entry point for the eval code
        esbuildOptions: (options) => {
            options.outbase = "./src";
        },
    }),
});
