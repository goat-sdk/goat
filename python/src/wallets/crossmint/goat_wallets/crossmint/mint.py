from goat.decorators.tool import Tool
from goat_wallets.evm import EVMWalletClient
from typing import Dict, Any, List

from .parameters import CollectionParameters, MintNFTParameters, EmptyParameters
from .api_client import CrossmintWalletsAPI


class CrossmintMintService:
    def __init__(self, api_client: CrossmintWalletsAPI):
        self.api_client = api_client

    @Tool({
        "description": "Create a new NFT collection",
        "parameters_schema": CollectionParameters
    })
    def create_collection(self, wallet_client: EVMWalletClient, parameters: dict) -> dict:
        try:
            result = self.api_client.create_collection(parameters, "polygon")
            if result.get("error"):
                raise Exception(result["message"])
            
            action = self.api_client.wait_for_action(result["actionId"])
            
            return {
                "collectionId": result["id"],
                "chain": "polygon",
                "contractAddress": action["data"]["collection"]["contractAddress"]
            }
        except Exception as error:
            raise Exception(f"Failed to create collection: {error}")

    @Tool({
        "description": "Get all collections",
        "parameters_schema": EmptyParameters
    })
    def get_all_collections(self, wallet_client: EVMWalletClient, parameters: dict) -> List[Dict[str, Any]]:
        try:
            collections = self.api_client.get_all_collections()
            return list(collections.values()) if isinstance(collections, dict) else collections
        except Exception as error:
            raise Exception(f"Failed to get collections: {error}")

    @Tool({
        "description": "Mint an NFT in a collection",
        "parameters_schema": MintNFTParameters
    })
    def mint_nft(self, wallet_client: EVMWalletClient, parameters: dict) -> dict:
        try:
            recipient = f"email:{parameters["recipient"]}:polygon" if parameters["recipient_type"] == "email" else f"polygon:{parameters["recipient"]}"
            
            result = self.api_client.mint_nft(
                parameters["collection_id"],
                recipient,
                parameters["metadata"]
            )
            
            if result.get("error"):
                raise Exception(result["message"])
            
            action = self.api_client.wait_for_action(result["actionId"])
            
            return {
                "id": result["id"],
                "collectionId": parameters["collection_id"],
                "contractAddress": result["onChain"]["contractAddress"],
                "chain": action["data"]["chain"]
            }
        except Exception as error:
            raise Exception(f"Failed to mint NFT: {error}")
