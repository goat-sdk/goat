import aiohttp
from goat.decorators.tool import Tool
from .parameters import (
    GetCastParameters,
    PublishCastParameters,
    SearchCastsParameters,
    GetConversationParameters
)


class FarcasterService:
    def __init__(self, api_key: str, base_url: str = "https://api.neynar.com/v2/farcaster"):
        self.api_key = api_key
        self.base_url = base_url

    @Tool({"description": "Get a cast by its URL or hash", "parameters_schema": GetCastParameters})
    async def get_cast(self, parameters: dict):
        url = f"{self.base_url}/cast?identifier={parameters['identifier']}&type={parameters['type']}"
        return await self._make_request("GET", url)

    @Tool({"description": "Publish a new cast", "parameters_schema": PublishCastParameters})
    async def publish_cast(self, parameters: dict):
        url = f"{self.base_url}/cast"
        return await self._make_request("POST", url, json={
            "signer_uuid": parameters['signer_uuid'],
            "text": parameters['text'],
            "parent": parameters.get('parent'),
            "channel_id": parameters.get('channel_id'),
        })

    @Tool({"description": "Search for casts", "parameters_schema": SearchCastsParameters})
    async def search_casts(self, parameters: dict):
        url = f"{self.base_url}/cast/search"
        return await self._make_request("GET", url, params={
            "q": parameters['query'],
            "limit": parameters.get('limit', 20)
        })

    @Tool({"description": "Get a conversation by its URL or hash", "parameters_schema": GetConversationParameters})
    async def get_conversation(self, parameters: dict):
        url = f"{self.base_url}/cast/conversation"
        return await self._make_request("GET", url, params={
            "identifier": parameters['identifier'],
            "type": parameters['type'],
            "reply_depth": parameters.get('reply_depth', 2),
            "limit": parameters.get('limit', 20),
        })

    async def _make_request(self, method, url, **kwargs):
        headers = kwargs.pop("headers", {})
        headers["x-api-key"] = self.api_key
        headers["content-type"] = "application/json"
        async with aiohttp.ClientSession() as session:
            async with session.request(method, url, headers=headers, **kwargs) as response:
                if not response.ok:
                    raise Exception(f"HTTP error! status: {response.status}, text: {await response.text()}")
                return await response.json()
