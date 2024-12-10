import type { z } from "zod";
import type { getNftInfoParametersSchema, getNftInfoResponseSchema } from "../parameters";

export async function getNftListings(
    apiKey: string | undefined,
    parameters: z.infer<typeof getNftInfoParametersSchema>,
) {
    let nftInfo: z.infer<typeof getNftInfoResponseSchema>;
    try {
        const response = await fetch(
            `https://api-mainnet.magiceden.dev/v2/tokens/${parameters.mintHash}/listings
`,
            {
                headers: {
                    "Content-Type": "application/json",
                    ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
                },
            },
        );

        nftInfo = (await response.json()) as z.infer<typeof getNftInfoResponseSchema>;
    } catch (error) {
        throw new Error(`Failed to get NFT listings: ${error}`);
    }

    return nftInfo[0];
}
