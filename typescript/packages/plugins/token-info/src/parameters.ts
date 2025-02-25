import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

export class TokenInfoParameters extends createToolParameters(
    z.object({
        symbol: z.string().min(1),
    }),
) {}
