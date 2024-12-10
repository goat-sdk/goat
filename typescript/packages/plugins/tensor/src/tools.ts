import type { SolanaWalletClient } from "@goat-sdk/core";

import type { DeferredTool } from "@goat-sdk/core";
import type { Connection } from "@solana/web3.js";
import { getBuyListingTransaction } from "./methods/getBuyListingTransaction";
import { getNftInfo } from "./methods/getNftInfo";
import { getNftInfoParametersSchema } from "./parameters";

export function getTools({
    apiKey,
    connection,
}: { apiKey: string; connection: Connection }): DeferredTool<SolanaWalletClient>[] {
    const getNftInfoTool: DeferredTool<SolanaWalletClient> = {
        name: "get_nft_info",
        description: "Gets information about a Solana NFT, from the Tensor API",
        parameters: getNftInfoParametersSchema,
        method: async (walletClient, parameters) => getNftInfo({ mintHash: parameters.mintHash, apiKey }),
    };

    const buyListingTool: DeferredTool<SolanaWalletClient> = {
        name: "get_buy_listing_transaction",
        description: "Gets a transaction to buy an NFT from a listing from the Tensor API",
        parameters: getNftInfoParametersSchema,
        method: async (walletClient, parameters) =>
            getBuyListingTransaction({ walletClient, mintHash: parameters.mintHash, apiKey, connection }),
    };

    return [getNftInfoTool, buyListingTool];
}
