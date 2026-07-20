import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

export class GetYieldSignalParameters extends createToolParameters(
    z.object({
        asset: z
            .enum(["USDC", "WETH"])
            .optional()
            .default("USDC")
            .describe("Which asset's Base lending yield to compare. Defaults to USDC."),
    }),
) {}
