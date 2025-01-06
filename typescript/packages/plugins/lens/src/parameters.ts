import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

export class GetPostOwnerParameterSchema extends createToolParameters(
    z.object({
        postURL: z.string(),
    })
) {}

export class TipParameters extends createToolParameters(
    z.object({
        to: z.string().describe("The address to transfer the token to"),
        amount: z
            .string()
            .describe("The amount of tokens to transfer in base units"),
    })
) {}

export const GetPostOwnerResponseSchema = z.object({
    publication: z.object({
        by: z.object({
            ownedBy: z.object({
                address: z.string(),
            }),
        }),
    }),
});
