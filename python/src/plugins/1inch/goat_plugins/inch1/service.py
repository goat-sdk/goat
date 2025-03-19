import aiohttp
from typing import Optional
from goat.decorators.tool import Tool
from .parameters import GetBalancesParameters

class OneInchService:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self.base_url = "https://api.1inch.dev"

    @Tool({
        "name": "1inch_get_balances",
        "description": "Get the balances of a wallet address on a specific chain",
        "parameters_schema": GetBalancesParameters
    })
    async def get_aggregated_balances(self, parameters: dict):
        """Get token balances and allowances for a wallet address on a specific chain."""
        wallet_address = parameters.get("wallet_address")
        if not wallet_address:
            raise ValueError("wallet_address is required")
            
        chain_id = parameters.get("chain_id", 1)  # Default to Ethereum mainnet

        url = f"{self.base_url}/balance/v1.2/{chain_id}/balances/{wallet_address}"

        headers = {
            "Accept": "application/json"
        }
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers) as response:
                if not response.ok:
                    raise Exception(f"Failed to fetch balances: {response.status} {await response.text()}")
                return await response.json()
