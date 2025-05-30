import { resolve } from "node:path";
import * as dotenv from "dotenv";
import { defineConfig } from "vitest/config";

dotenv.config({ path: resolve(__dirname, ".env") });
dotenv.config({ path: resolve(__dirname, "src/__tests__/.env") });

export default defineConfig({
    test: {
        environment: "node",
        include: ["src/__tests__/**/*.test.ts"],
        globals: true,
        testTimeout: 180000, // 180 seconds
    },
});
