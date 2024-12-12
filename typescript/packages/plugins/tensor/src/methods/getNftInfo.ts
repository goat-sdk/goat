import type { z } from "zod";
import type { getNftInfoResponseSchema } from "../parameters";

export async function getNftInfo({ mintHash, apiKey }: { mintHash: string; apiKey: string }) {
    let nftInfo: z.infer<typeof getNftInfoResponseSchema>;
    try {
        const response = await fetch(`https://api.mainnet.tensordev.io/api/v1/mint?mints=${mintHash}`, {
            headers: {
                "Content-Type": "application/json",
                "x-tensor-api-key": apiKey,
            },
        });

        nftInfo = (await response.json()) as z.infer<typeof getNftInfoResponseSchema>;
    } catch (error) {
        throw new Error(`Failed to get NFT info: ${error}`);
    }

    return nftInfo[0];
}
