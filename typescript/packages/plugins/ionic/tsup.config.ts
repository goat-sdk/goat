import { defineConfig } from "tsup";
import { treeShakableConfig } from "../../../tsup.config.base";

export default defineConfig({
    ...treeShakableConfig,
    external: [],
    treeshake: true,
    onSuccess: "tsc --project tsconfig.dts.json",
    loader: {
        '.json': 'json'
    }
});