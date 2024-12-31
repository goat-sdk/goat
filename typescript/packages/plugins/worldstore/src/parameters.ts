import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

export class SearchParameters extends createToolParameters(
    z.object({
        query: z.string(),
        limit: z.number().optional(),
    }),
) {}

export class BuyProductParameters extends createToolParameters(
    z.object({
        contractAddress: z.string(),
        productId: z.string(),
        to: z.string(),
        quantity: z.number(),
    }),
) {}
