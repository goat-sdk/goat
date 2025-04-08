import { Mastra } from "@mastra/core";

import { shopifyAgent } from "./agents/shopifyAgent.js";

export const mastra = new Mastra({
    agents: { shopifyAgent },
});
