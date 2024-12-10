import type { SolanaWalletClient } from "@goat-sdk/core";

import type { DeferredTool } from "@goat-sdk/core";
import type { Connection } from "@solana/web3.js";
import { buyListing } from "./methods/buyListing";
import { getNftListings } from "./methods/getNftListings";
import { getNftInfoParametersSchema } from "./parameters";

export function getTools({
    apiKey,
    connection,
}: { apiKey: string; connection: Connection }): DeferredTool<SolanaWalletClient>[] {
    const getNftListingsTool: DeferredTool<SolanaWalletClient> = {
        name: "get_nft_listings",
        description: "Gets information about a Solana NFT, from the Magic Eden API",
        parameters: getNftInfoParametersSchema,
        method: async (walletClient, parameters) => getNftListings(apiKey, parameters),
    };

    const buyListingTool: DeferredTool<SolanaWalletClient> = {
        name: "get_buy_listing_transaction",
        description: "Gets a transaction to buy a Solana NFT from a listing from the Magic Eden API",
        parameters: getNftInfoParametersSchema,
        method: async (walletClient, parameters) => buyListing(apiKey, connection, walletClient, parameters),
    };

    return [getNftListingsTool, buyListingTool];
}
