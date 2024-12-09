import type { SolanaWalletClient } from "@goat-sdk/core";

import type { DeferredTool } from "@goat-sdk/core";
import type { Connection } from "@solana/web3.js";
import type { z } from "zod";
import {
    getBuyListingTransactionParametersSchema,
    type getBuyListingTransactionResponseSchema,
    getNftInfoParametersSchema,
    type getNftInfoResponseSchema,
} from "./parameters";
import { deserializeTxResponseToInstructions } from "./utils/deserializeTxResponseToInstructions";

export function getTools({
    apiKey,
    connection,
}: { apiKey: string; connection: Connection }): DeferredTool<SolanaWalletClient>[] {
    const getNftInfoTool: DeferredTool<SolanaWalletClient> = {
        name: "get_nft_info",
        description: "Gets information about a Solana NFT, from the Tensor API",
        parameters: getNftInfoParametersSchema,
        method: async (walletClient, parameters) => {
            let nftInfo: z.infer<typeof getNftInfoResponseSchema>;
            try {
                const response = await fetch(
                    `https://api.mainnet.tensordev.io/api/v1/mint?mints=${parameters.mintHash}`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "x-tensor-api-key": apiKey,
                        },
                    },
                );

                nftInfo = (await response.json()) as z.infer<typeof getNftInfoResponseSchema>;
            } catch (error) {
                throw new Error(`Failed to get NFT info: ${error}`);
            }

            return nftInfo[0];
        },
    };

    const buyListingTool: DeferredTool<SolanaWalletClient> = {
        name: "get_buy_listing_transaction",
        description: "Gets a transaction to buy an NFT from a listing from the Tensor API",
        parameters: getBuyListingTransactionParametersSchema,
        method: async (walletClient, parameters) => {
            let data: z.infer<typeof getBuyListingTransactionResponseSchema>;

            const queryParams = new URLSearchParams({
                buyer: walletClient.getAddress(),
                mintHash: parameters.mintHash,
                owner: parameters.owner,
                maxPrice: parameters.maxPrice,
            });

            try {
                const response = await fetch(`https://api.mainnet.tensordev.io/api/v1/buy?${queryParams.toString()}`, {
                    headers: {
                        "Content-Type": "application/json",
                        "x-tensor-api-key": apiKey,
                    },
                });

                data = (await response.json()) as z.infer<typeof getBuyListingTransactionResponseSchema>;
            } catch (error) {
                throw new Error(`Failed to get buy listing transaction: ${error}`);
            }

            const { versionedTransaction, instructions } = await deserializeTxResponseToInstructions(connection, data);
            const lookupTableAddresses = versionedTransaction.message.addressTableLookups.map(
                (lookup) => lookup.accountKey,
            );
            return { versionedTransaction, instructions, lookupTableAddresses };
        },
    };

    return [getNftInfoTool, buyListingTool];
}
