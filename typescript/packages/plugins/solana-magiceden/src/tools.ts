import type { SolanaWalletClient, Tool } from "@goat-sdk/core";

import type { Connection } from "@solana/web3.js";
import { buyListing } from "./methods/buyListing";
import { getNftListings } from "./methods/getNftListings";
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
    const getNftListingsTool: Tool = {
        name: "get_nft_listings",
        description: "Gets information about a Solana NFT, from the Magic Eden API",
        parameters: getNftInfoParametersSchema,
        method: async (parameters) => getNftListings(apiKey, parameters),
    };

    const buyListingTool: Tool = {
        name: "get_buy_listing_transaction",
        description: "Gets a transaction to buy a Solana NFT from a listing from the Magic Eden API",
        parameters: getNftInfoParametersSchema,
        method: async (parameters) => buyListing(apiKey, connection, walletClient, parameters),
    };

    return [getNftListingsTool, buyListingTool];
}
