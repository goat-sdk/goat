import aiohttp
from typing import Optional
from goat.decorators.tool import Tool
from .parameters import GetAlloraPricePredictionParameters, AlloraPricePredictionToken, AlloraPricePredictionTimeframe


class AlloraService:
    def __init__(self, api_key: Optional[str] = None, api_root: str = "https://api.upshot.xyz/v2/allora"):
        self.api_key = api_key
        self.api_root = api_root.rstrip('/')  # Remove trailing slash if present

    @Tool({
        "description": "Fetch a future price prediction for BTC or ETH for a given timeframe (5m or 8h)",
        "parameters_schema": GetAlloraPricePredictionParameters
    })
    async def get_price_prediction(self, parameters: dict):
        """Fetch a future price prediction for a crypto asset from Allora Network"""
        # Default to ethereum-11155111 (Sepolia) as in TypeScript version
        signature_format = "ethereum-11155111"
        
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        if self.api_key:
            headers["x-api-key"] = self.api_key

        # Extract parameters
        ticker = parameters["ticker"]
        timeframe = parameters["timeframe"]

        # Construct URL following TypeScript pattern
        url = f"{self.api_root}/consumer/price/{signature_format}/{ticker}/{timeframe}"

        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers) as response:
                if not response.ok:
                    raise Exception(
                        f"Allora plugin: error requesting price prediction: url={url} "
                        f"status={response.status} body={await response.text()}"
                    )
                
                data = await response.json()
                
                # Validate response structure
                if not data.get("data", {}).get("inference_data"):
                    raise Exception(f"API response missing data: {data}")
                
                return data["data"]["inference_data"]
