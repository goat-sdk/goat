import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

export class IrysDeployParams extends createToolParameters(
    z.object({
        token: z
            .enum([
                "ethereum",
                "matic",
                "bnb",
                "avalanche",
                "baseeth",
                "usdceth",
                "arbitrum",
                "chainlink",
                "usdcpolygon",
                "bera",
                "scrolleth",
                "lineaeth",
                "iotex",
            ])
            .describe("Token name to integrate irys xyz"),
    }),
) {}
