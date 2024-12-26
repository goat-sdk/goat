import { Tool } from "@goat-sdk/core";
import { SolanaWalletClient } from "@goat-sdk/wallet-solana";
import { z } from "zod";
import { GetNftInfoParameters, getBuyListingTransactionResponseSchema, getNftInfoResponseSchema } from "./parameters";
import { deserializeTxResponseToInstructions } from "./utils/deserializeTxResponseToInstructions";

export class TensorService {
    constructor(private readonly apiKey: string) {}

    @Tool({
        description: "Get information about an NFT from the Tensor API",
    })
    async getNftInfo(parameters: GetNftInfoParameters) {
        let nftInfo: z.infer<typeof getNftInfoResponseSchema>;
        try {
            const response = await fetch(`https://api.mainnet.tensordev.io/api/v1/mint?mints=${parameters.mintHash}`, {
                headers: {
                    "Content-Type": "application/json",
                    "x-tensor-api-key": this.apiKey,
                },
            });

            nftInfo = (await response.json()) as z.infer<typeof getNftInfoResponseSchema>;
        } catch (error) {
            throw new Error(`Failed to get NFT info: ${error}`);
        }

        return nftInfo[0];
    }

    @Tool({
        description: "Get a transaction to buy an NFT from a listing from the Tensor API",
    })
    async getBuyListingTransaction(walletClient: SolanaWalletClient, parameters: GetNftInfoParameters) {
        const nftInfo = await this.getNftInfo(parameters);

        const price = nftInfo.listing?.price;
        const owner = nftInfo.owner;

        if (!price || !owner) {
            throw new Error(`No listing found for ${parameters.mintHash}`);
        }

        const queryParams = new URLSearchParams({
            buyer: walletClient.getAddress(),
            mint: parameters.mintHash,
            owner,
            maxPrice: price,
            blockhash: "11111111111111111111111111111111",
        });

        let data: z.infer<typeof getBuyListingTransactionResponseSchema>;
        try {
            const response = await fetch(`https://api.mainnet.tensordev.io/api/v1/tx/buy?${queryParams.toString()}`, {
                headers: {
                    "Content-Type": "application/json",
                    "x-tensor-api-key": this.apiKey,
                },
            });

            data = (await response.json()) as z.infer<typeof getBuyListingTransactionResponseSchema>;
            console.log(data);
        } catch (error) {
            throw new Error(`Failed to get buy listing transaction: ${error}`);
        }

        const { versionedTransaction, instructions } = await deserializeTxResponseToInstructions(
            walletClient.getConnection(),
            data,
        );
        const lookupTableAddresses = versionedTransaction.message.addressTableLookups.map(
            (lookup) => lookup.accountKey,
        );
        return { versionedTransaction, instructions, lookupTableAddresses };
    }
}
