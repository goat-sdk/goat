import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

export class ExampleParameters extends createToolParameters(
    z.object({
        exampleField: z.string().describe("An example field"),
    }),
) {}
