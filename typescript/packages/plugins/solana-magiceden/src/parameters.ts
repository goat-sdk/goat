import { z } from "zod";

export const getNftInfoParametersSchema = z.object({
    mintHash: z.string(),
});

export const getNftInfoResponseSchema = z.array(
    z.object({
        pdaAddress: z.string(),
        auctionHouse: z.string().optional(),
        tokenAddress: z.string().optional(),
        tokenMint: z.string().optional(),
        seller: z.string(),
        sellerReferral: z.string().optional(),
        tokenSize: z.number().optional(),
        price: z.number(),
        priceInfo: z
            .object({
                solPrice: z.object({
                    rawAmount: z.string(),
                    address: z.string(),
                    decimals: z.number(),
                }),
            })
            .optional(),
        rarity: z.any().optional(),
        extra: z.any().optional(),
        expiry: z.number().optional(),
        token: z.any().optional(),
        listingSource: z.string().optional(),
    }),
);

export const getBuyListingTransactionResponseSchema = z.object({
    v0: z.object({
        tx: z.object({
            type: z.string(),
            data: z.array(z.number()),
        }),
        txSigned: z.object({
            type: z.string(),
            data: z.array(z.number()),
        }),
    }),
});