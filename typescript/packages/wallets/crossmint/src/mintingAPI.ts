import { randomUUID } from "node:crypto";
import type { Plugin, WalletClient } from "@goat-sdk/core";
import { z } from "zod";

export const mintingAPIFactory = (
    apiKey: string,
): ((options: { env: "production" | "staging" }) => Plugin<WalletClient>) => {
    return ({ env }) => ({
        name: "minting_api",
        supportsSmartWallets: () => true,
        supportsChain: (chain) => chain.type === "solana" || chain.type === "evm" || chain.type === "aptos",
        getTools: async () => {
            return [
                {
                    name: "create_nft_collection",
                    description: "This {{tool}} creates an NFT collection and returns the ID of the collection.",
                    parameters: createCollectionParametersSchema,
                    method: createCollectionMethod(apiKey, env),
                },
                {
                    name: "mint_nft",
                    description:
                        "This {{tool}} mints an NFT to a recipient from a collection and returns the transaction hash. Requires a collection ID of an already deployed collection.",
                    parameters: mintNFTParametersSchema,
                    method: mintNFTMethod(apiKey, env),
                },
            ];
        },
    });
};

const createCollectionParametersSchema = z.object({
    metadata: z
        .object({
            name: z.string().describe("The name of the collection"),
            description: z.string().describe("The description of the collection"),
            image: z.string().describe("The image of the collection"),
        })
        .optional()
        .default({
            name: "My first Minting API Collection",
            description:
                "An NFT Collection created with the Crossmint Minting API - learn more at https://www.crossmint.com/products/nft-minting-api",
            image: "https://www.crossmint.com/assets/crossmint/logo.png",
        })
        .describe("The metadata of the collection"),
    chain: z.string().describe("The name of the blockchain that the collection is being created on"),
});

const mintNFTParametersSchema = z.object({
    collectionId: z.string().describe("The ID of the collection to mint the NFT in"),
    recipient: z.string().describe("A locator for the recipient of the NFT, in the format <chain>:<address>"),
    metadata: z
        .object({
            name: z.string().describe("The name of the NFT"),
            description: z.string().describe("The description of the NFT"),
            image: z.string().describe("The image of the NFT"),
        })
        .describe("The metadata of the NFT"),
});

function createCollectionMethod(apiKey: string, env: "staging" | "production") {
    return async (_walletClient: WalletClient, parameters: z.infer<typeof createCollectionParametersSchema>) => {
        const id = randomUUID().toString();
        await fetch(`${getBaseUrl(env)}/collections/${id}`, {
            method: "PUT",
            body: JSON.stringify({
                ...parameters,
            }),
            headers: {
                "x-api-key": apiKey,
                "Content-Type": "application/json",
            },
        });
        const body = await waitForAction(id, apiKey, env);
        return {
            collectionId: id,
            chain: parameters.chain,
            contractAddress: body.data.collection.contractAddress,
        };
    };
}

function mintNFTMethod(apiKey: string, env: "staging" | "production") {
    return async (_walletClient: WalletClient, parameters: z.infer<typeof mintNFTParametersSchema>) => {
        const id = randomUUID().toString();
        await fetch(`${getBaseUrl(env)}/collections/${parameters.collectionId}/nfts/${id}`, {
            method: "PUT",
            body: JSON.stringify({
                recipient: parameters.recipient,
                metadata: parameters.metadata,
            }),
            headers: {
                "x-api-key": apiKey,
                "Content-Type": "application/json",
            },
        });
        const body = await waitForAction(id, apiKey, env);
        return body.data.txId as string;
    };
}

async function waitForAction(actionId: string, apiKey: string, env: "staging" | "production") {
    let attempts = 0;
    while (true) {
        attempts++;
        const response = await fetch(`${getBaseUrl(env)}/actions/${actionId}`, {
            headers: {
                "x-api-key": apiKey,
            },
        });
        const body = await response.json();

        if (response.status === 200 && body.status === "succeeded") {
            return body;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (attempts >= 60) {
            throw new Error(`Timed out waiting for action ${actionId} after ${attempts} attempts`);
        }
    }
}

function getBaseUrl(env: "staging" | "production") {
    return env === "staging"
        ? "https://staging.crossmint.com/api/2022-06-09"
        : "https://www.crossmint.com/api/2022-06-09";
}
