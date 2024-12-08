import type { DeferredTool,  EVMWalletClient,  WalletClient } from "@goat-sdk/core";
import type { z } from "zod";

import {
    buyProductParametersSchema,
    searchProductsParametersSchema,
} from "./parameters";

export function getTools(): DeferredTool<EVMWalletClient>[] {
    return [
        {
            name: 'search_products',
            description: 'This {{tool}} searches for products on all stores within the WorldStore',
            parameters: searchProductsParametersSchema,
            method: async (walletClient, parameters: z.infer<typeof searchProductsParametersSchema>) => searchWorldstoreProducts(parameters),
        },
        {
            name: "buy_product",
            description: "This {{tool}} buys a product from the WorldStore",
            parameters: buyProductParametersSchema,
            method: async (walletClient, parameters: z.infer<typeof buyProductParametersSchema>) => buyWorldstoreProduct(parameters),
        }
    ];
}


async function searchWorldstoreProducts(parameters: z.infer<typeof searchProductsParametersSchema>) {
    const res = await fetch(`https://dserver.maxf.io/api/worldstore/products/search?query=${parameters.query}&limit=${parameters.limit}`, {
        headers: {
            "Content-Type": "application/json",
        },
    });

    let json;
    try {
        json = await res.json() as any[];
    } catch (e) {
        throw new Error(`Failed to parse response as JSON: ${e}`);
    }

    return JSON.stringify(json);
}

async function buyWorldstoreProduct(parameters: z.infer<typeof buyProductParametersSchema>) {
    console.log("Buying product:", parameters);
    return "Product bought successfully";
}
