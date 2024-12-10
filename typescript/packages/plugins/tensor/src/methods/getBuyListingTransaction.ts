import type { SolanaWalletClient } from "@goat-sdk/core";
import type { Connection } from "@solana/web3.js";
import type { z } from "zod";
import type { getBuyListingTransactionResponseSchema } from "../parameters";
import { deserializeTxResponseToInstructions } from "../utils/deserializeTxResponseToInstructions";
import { getNftInfo } from "./getNftInfo";

export async function getBuyListingTransaction({
    walletClient,
    mintHash,
    apiKey,
    connection,
}: { walletClient: SolanaWalletClient; mintHash: string; apiKey: string; connection: Connection }) {
    const nftInfo = await getNftInfo({ mintHash, apiKey });

    const price = nftInfo.listing?.price;
    const owner = nftInfo.owner;

    if (!price || !owner) {
        throw new Error(`No listing found for ${mintHash}`);
    }

    const queryParams = new URLSearchParams({
        buyer: walletClient.getAddress(),
        mint: mintHash,
        owner,
        maxPrice: price,
        blockhash: "11111111111111111111111111111111",
    });

    let data: z.infer<typeof getBuyListingTransactionResponseSchema>;
    try {
        const response = await fetch(`https://api.mainnet.tensordev.io/api/v1/tx/buy?${queryParams.toString()}`, {
            headers: {
                "Content-Type": "application/json",
                "x-tensor-api-key": apiKey,
            },
        });

        data = (await response.json()) as z.infer<typeof getBuyListingTransactionResponseSchema>;
        console.log(data);
    } catch (error) {
        throw new Error(`Failed to get buy listing transaction: ${error}`);
    }

    const { versionedTransaction, instructions } = await deserializeTxResponseToInstructions(connection, data);
    const lookupTableAddresses = versionedTransaction.message.addressTableLookups.map((lookup) => lookup.accountKey);
    return { versionedTransaction, instructions, lookupTableAddresses };
}
