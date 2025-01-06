import { Tool } from "@goat-sdk/core";
import { z } from "zod";
import {
    GetPostOwnerParameterSchema,
    GetPostOwnerResponseSchema,
} from "./parameters";

import { fetchPost } from "./utils/lens.query";

export class LensService {
    @Tool({
        description: "Get wallet address for creator of the given post",
    })
    async getWalletAddressofGivenPost(parameters: GetPostOwnerParameterSchema) {
        const link = parameters.postURL;
        const regex = /https:\/\/hey\.xyz\/posts\/(.*)/;
        const match = link.match(regex);

        console.log({ match });

        if (!match) {
            throw new Error(
                `Please submit a valid link. Submitted link: ${link}`
            );
        }

        let postOwner: z.infer<typeof GetPostOwnerResponseSchema>;
        try {
            const response = await fetch("https://api-v2.lens.dev/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query: `query Publication($request: PublicationRequest!) {
                        publication(request: $request) {
                          ... on Post {
                            by {
                              ownedBy {
                                address
                              }
                            }
                          }
                        }
                      }`,
                    variables: {
                        request: {
                            forId: match[1],
                        },
                    },
                }),
            });

            postOwner = (await response.json()) as z.infer<
                typeof GetPostOwnerResponseSchema
            >;
        } catch (error) {
            throw new Error(
                `Failed to get NFT collection statistics: ${error}`
            );
        }

        return postOwner;
    }
}
