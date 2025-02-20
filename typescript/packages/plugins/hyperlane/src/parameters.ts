import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

export class HyperlaneDeployParameters extends createToolParameters(
    z.object({
        origin: z.string().describe("The origin chain name"),
        destination: z.string().describe("The destination chain name"),
        token: z.string().describe("The token address of the origin"),
    }),
) {}
