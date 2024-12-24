import { CrossmintApiClient } from "@crossmint/common-sdk-base";
import { Tool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { getCrossmintChainString } from "../chains";
import { GetAllCollectionsParameters, MintNFTParameters } from "./mint.parameters";

export class CrossmintMintService {
    constructor(private readonly client: CrossmintApiClient) {}

    @Tool({
        description: "Create a new collection and return the id of the collection",
    })
    async createCollection(walletClient: EVMWalletClient, parameters: MintNFTParameters) {
        // TODO: add chain as a parameter
        const response = await fetch(`${this.client.baseUrl}/api/2022-06-09/collections/`, {
            method: "POST",
            body: JSON.stringify({
                ...parameters,
                chain: getCrossmintChainString(walletClient.getChain()),
            }),
            headers: {
                ...this.client.authHeaders,
                "Content-Type": "application/json",
            },
        });

        const result = await response.json();

        if (result.error) {
            throw new Error(result.message);
        }

        const { id, actionId } = result;

        const action = await this.waitForAction(actionId);

        const chain = getCrossmintChainString(walletClient.getChain());

        return {
            collectionId: id,
            chain,
            contractAddress: action.data.collection.contractAddress,
        };
    }

    @Tool({
        description: "Get all collections created by the user",
    })
    async getAllCollections(walletClient: EVMWalletClient, parameters: GetAllCollectionsParameters) {
        const response = await fetch(`${this.client.baseUrl}/api/2022-06-09/collections/`, {
            headers: {
                ...this.client.authHeaders,
                "Content-Type": "application/json",
            },
        });

        return await response.json();
    }

    @Tool({
        description:
            "Mint an NFT to a recipient from a collection and return the transaction hash. Requires a collection ID of an already deployed collection.",
    })
    async mintNFT(walletClient: EVMWalletClient, parameters: MintNFTParameters) {
        let recipient: string;

        // TODO: add chain as a parameter
        if (parameters.recipientType === "email") {
            recipient = `email:${parameters.recipient}:${getCrossmintChainString(walletClient.getChain())}`;
        } else {
            recipient = `${getCrossmintChainString(walletClient.getChain())}:${parameters.recipient}`;
        }

        const response = await fetch(
            `${this.client.baseUrl}/api/2022-06-09/collections/${parameters.collectionId}/nfts`,
            {
                method: "POST",
                body: JSON.stringify({
                    recipient,
                    metadata: parameters.metadata,
                }),
                headers: {
                    ...this.client.authHeaders,
                    "Content-Type": "application/json",
                },
            },
        );

        const result = await response.json();

        if (result.error) {
            throw new Error(result.message);
        }

        const { id, actionId, onChain } = result;

        const action = await this.waitForAction(actionId);

        return {
            id: id,
            collectionId: parameters.collectionId,
            contractAddress: onChain.contractAddress,
            chain: action.data.chain,
        };
    }

    private async waitForAction(actionId: string) {
        let attempts = 0;
        while (true) {
            attempts++;
            const response = await fetch(`${this.client.baseUrl}/api/2022-06-09/actions/${actionId}`, {
                headers: {
                    ...this.client.authHeaders,
                    "Content-Type": "application/json",
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
}
