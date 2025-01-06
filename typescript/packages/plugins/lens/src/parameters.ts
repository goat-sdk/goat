import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

export class GetPostOwnerParameterSchema extends createToolParameters(
    z.object({
        postURL: z.string(),
    })
) {}

export class GetNftSalesParametersSchema extends createToolParameters(
    z.object({
        collectionSlug: z.string(),
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
