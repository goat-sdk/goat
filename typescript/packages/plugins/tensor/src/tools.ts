import type { SolanaWalletClient } from "@goat-sdk/core";

import type { Tool } from "@goat-sdk/core";
import type { Connection } from "@solana/web3.js";
import { getBuyListingTransaction } from "./methods/getBuyListingTransaction";
import { getNftInfo } from "./methods/getNftInfo";
import { getNftInfoParametersSchema } from "./parameters";

export function getTools({
    walletClient,
    apiKey,
    connection,
}: {
    walletClient: SolanaWalletClient;
    apiKey: string;
    connection: Connection;
}): Tool[] {
    const getNftInfoTool: Tool = {
        name: "get_nft_info",
        description: "Gets information about a Solana NFT, from the Tensor API",
        parameters: getNftInfoParametersSchema,
        method: async (parameters) => getNftInfo({ mintHash: parameters.mintHash, apiKey }),
    };

    const buyListingTool: Tool = {
        name: "get_buy_listing_transaction",
        description: "Gets a transaction to buy an NFT from a listing from the Tensor API",
        parameters: getNftInfoParametersSchema,
        method: async (parameters) =>
            getBuyListingTransaction({
                walletClient,
                mintHash: parameters.mintHash,
                apiKey,
                connection,
            }),
    };

    return [getNftInfoTool, buyListingTool];
}
