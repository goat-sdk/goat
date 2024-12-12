import type { CrossmintApiClient } from "@crossmint/common-sdk-base";
import type { Plugin, WalletClient } from "@goat-sdk/core";
import { z } from "zod";
import { getCrossmintChainString, isChainSupportedByMinting } from "./chains";

export const mintingFactory = (client: CrossmintApiClient): (() => Plugin<WalletClient>) => {
    return () => ({
        name: "minting",
        supportsSmartWallets: () => true,
        supportsChain: (chain) => {
            if (chain.type === "evm") {
                return isChainSupportedByMinting(chain.id ?? 0);
            }

            if (chain.type === "aptos" || chain.type === "solana") {
                return true;
            }

            return false;
        },
        getTools: async (walletClient: WalletClient) => {
            return [
                {
                    name: "create_nft_collection",
                    description: "This {{tool}} creates an NFT collection and returns the ID of the collection.",
                    parameters: createCollectionParametersSchema,
                    method: createCollectionMethod(client, walletClient),
                },
                {
                    name: "get_all_collections",
                    description: "This {{tool}} gets all the collections created by the user.",
                    parameters: getAllCollectionsParametersSchema,
                    method: getAllCollectionsMethod(client, walletClient),
                },
                {
                    name: "mint_nft",
                    description:
                        "This {{tool}} mints an NFT to a recipient from a collection and returns the transaction hash. Requires a collection ID of an already deployed collection.",
                    parameters: mintNFTParametersSchema,
                    method: mintNFTMethod(client, walletClient),
                },
            ];
        },
    });
};

const createCollectionParametersSchema = z.object({
    metadata: z
        .object({
            name: z.string().describe("The name of the collection"),
            description: z.string().describe("A description of the NFT collection"),
            image: z.string().optional().describe("URL pointing to an image that represents the collection"),
            symbol: z
                .string()
                .optional()
                .describe("Shorthand identifier for the NFT collection (Max length: 10). Defaults to 'TOKEN'"),
        })
        .default({
            name: "My first Minting API Collection",
            description:
                "An NFT Collection created with the Crossmint Minting API - learn more at https://www.crossmint.com/products/nft-minting-api",
            image: "https://www.crossmint.com/assets/crossmint/logo.png",
        })
        .describe("The metadata of the collection"),
    fungibility: z
        .enum(["semi-fungible", "non-fungible"])
        .optional()
        .default("non-fungible")
        .describe("Whether or not this collection is fungible (e.g ERC-1155 vs ERC-721)"),
    transferable: z
        .boolean()
        .optional()
        .default(true)
        .describe("Whether or not the NFTs in this collection are transferable"),
});

const getAllCollectionsParametersSchema = z.object({});

const mintNFTParametersSchema = z.object({
    collectionId: z.string().describe("The ID of the collection to mint the NFT in"),
    recipient: z
        .string()
        .describe(
            "A locator for the recipient of the NFT, in the format `<address>` if it's a wallet or `email:<email_address>` if it's an email",
        ),
    metadata: z
        .object({
            name: z.string().describe("The name of the NFT"),
            description: z.string().max(64).describe("The description of the NFT"),
            image: z.string().describe("URL pointing to the NFT image"),
            animation_url: z.string().optional().describe("URL pointing to the NFT animation"),
            attributes: z
                .array(
                    z.object({
                        display_type: z
                            .enum(["number", "boost_number", "boost_percentage"])
                            .describe("The type of the attribute, if it's a number or a percentage"),
                        value: z.string().describe("The trait value"),
                    }),
                )
                .optional()
                .describe("The attributes of the NFT"),
        })
        .describe("The metadata of the NFT"),
});

function getAllCollectionsMethod(client: CrossmintApiClient, walletClient: WalletClient) {
    return async () => {
        const response = await fetch(`${client.baseUrl}/collections/`, {
            headers: client.authHeaders,
        });

        return await response.json();
    };
}

function createCollectionMethod(client: CrossmintApiClient, walletClient: WalletClient) {
    return async (parameters: z.infer<typeof createCollectionParametersSchema>) => {
        const response = await fetch(`${client.baseUrl}/api/2022-06-09/collections/`, {
            method: "POST",
            body: JSON.stringify({
                ...parameters,
                chain: getCrossmintChainString(walletClient.getChain()),
            }),
            headers: client.authHeaders,
        });

        const result = await response.json();

        if (result.error) {
            throw new Error(result.message);
        }

        const { id, actionId } = result;

        const action = await waitForAction(actionId, client);

        const chain = getCrossmintChainString(walletClient.getChain());

        return {
            collectionId: id,
            chain,
            contractAddress: action.data.collection.contractAddress,
        };
    };
}

function mintNFTMethod(client: CrossmintApiClient, walletClient: WalletClient) {
    return async (parameters: z.infer<typeof mintNFTParametersSchema>) => {
        let recipient: string;

        if (parameters.recipient.startsWith("email:")) {
            recipient = `${parameters.recipient}:${getCrossmintChainString(walletClient.getChain())}`;
        } else {
            recipient = `${getCrossmintChainString(walletClient.getChain())}:${parameters.recipient}`;
        }

        const response = await fetch(`${client.baseUrl}/api/2022-06-09/collections/${parameters.collectionId}/nfts`, {
            method: "POST",
            body: JSON.stringify({
                recipient,
                metadata: parameters.metadata,
            }),
            headers: {
                ...client.authHeaders,
                "Content-Type": "application/json",
            },
        });

        const result = await response.json();

        if (result.error) {
            throw new Error(result.message);
        }

        const { id, actionId, onChain } = result;

        const action = await waitForAction(actionId, client);

        return {
            id: id,
            collectionId: parameters.collectionId,
            contractAddress: onChain.contractAddress,
            chain: action.data.chain,
        };
    };
}

async function waitForAction(actionId: string, client: CrossmintApiClient) {
    let attempts = 0;
    while (true) {
        attempts++;
        const response = await fetch(`${client.baseUrl}/api/2022-06-09/actions/${actionId}`, {
            headers: client.authHeaders,
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
