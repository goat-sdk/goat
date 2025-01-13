import aiohttp
from goat.decorators.tool import Tool
from .parameters import (
    GetNftCollectionStatisticsParameters,
    GetNftSalesParameters,
    NftCollectionStatisticsResponse,
    NftSalesResponse,
)


class OpenSeaService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.opensea.io/api/v2"

    @Tool({
        "description": "Get NFT collection statistics",
        "parameters_schema": GetNftCollectionStatisticsParameters
    })
    async def get_nft_collection_statistics(self, parameters: dict) -> NftCollectionStatisticsResponse:
        """Get statistics for an NFT collection from OpenSea"""
        async with aiohttp.ClientSession() as session:
            url = f"{self.base_url}/collections/{parameters['collectionSlug']}/stats"
            headers = {
                "accept": "application/json",
                "x-api-key": self.api_key
            }
            async with session.get(url, headers=headers) as response:
                if not response.ok:
                    raise Exception(f"Failed to get NFT collection statistics: HTTP {response.status} - {await response.text()}")
                data = await response.json()
                return NftCollectionStatisticsResponse.model_validate(data)

    @Tool({
        "description": "Get recent NFT sales",
        "parameters_schema": GetNftSalesParameters
    })
    async def get_nft_sales(self, parameters: dict) -> list:
        """Get recent NFT sales for a collection from OpenSea"""
        async with aiohttp.ClientSession() as session:
            url = f"{self.base_url}/events/collection/{parameters['collectionSlug']}?event_type=sale&limit=5"
            headers = {
                "accept": "application/json",
                "x-api-key": self.api_key
            }
            async with session.get(url, headers=headers) as response:
                if not response.ok:
                    raise Exception(f"Failed to get NFT sales: HTTP {response.status} - {await response.text()}")
                data = await response.json()
                sales_response = NftSalesResponse.model_validate(data)
                
                # Transform the response to match TypeScript implementation
                return [{
                    "name": event.nft.name,
                    "seller": event.seller,
                    "buyer": event.buyer,
                    "price": float(event.payment.quantity) / 10 ** event.payment.decimals
                } for event in sales_response.asset_events]
