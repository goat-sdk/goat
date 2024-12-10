import type { SolanaWalletClient } from "@goat-sdk/core";
import { type Connection, VersionedTransaction } from "@solana/web3.js";
import type { z } from "zod";
import type { getBuyListingTransactionResponseSchema, getNftInfoParametersSchema } from "../parameters";
import { decompileVersionedTransactionToInstructions } from "../utils/decompileVersionedTransactionToInstructions";
import { getNftListings } from "./getNftListings";

export async function buyListing(
    apiKey: string,
    connection: Connection,
    walletClient: SolanaWalletClient,
    parameters: z.infer<typeof getNftInfoParametersSchema>,
) {
    const nftInfo = await getNftListings(apiKey, parameters);

    const queryParams = new URLSearchParams({
        buyer: walletClient.getAddress(),
        seller: nftInfo.seller,
        tokenMint: parameters.mintHash,
        tokenATA: nftInfo.tokenAddress,
        price: nftInfo.price.toString(),
        ...(nftInfo.auctionHouse ? { auctionHouseAddress: nftInfo.auctionHouse } : {}),
    });

    let data: z.infer<typeof getBuyListingTransactionResponseSchema>;
    try {
        const response = await fetch(
            `https://api-mainnet.magiceden.dev/v2/instructions/buy_now?${queryParams.toString()}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
                },
            },
        );

        data = (await response.json()) as z.infer<typeof getBuyListingTransactionResponseSchema>;
    } catch (error) {
        throw new Error(`Failed to get buy listing transaction: ${error}`);
    }

    const versionedTransaction = VersionedTransaction.deserialize(Buffer.from(data.v0.tx.data));
    const instructions = await decompileVersionedTransactionToInstructions(connection, versionedTransaction);
    const lookupTableAddresses = versionedTransaction.message.addressTableLookups.map((lookup) => lookup.accountKey);

    return { versionedTransaction, instructions, lookupTableAddresses };
}
