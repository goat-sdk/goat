import aiohttp
from goat.decorators.tool import Tool
from .parameters import (
    CryptocurrencyListingsParameters,
    CryptocurrencyQuotesLatestParameters,
    ExchangeListingsParameters,
    ExchangeQuotesLatestParameters,
    ContentLatestParameters,
    CryptocurrencyMapParameters,
    CryptocurrencyOHLCVLatestParameters,
    CryptocurrencyTrendingLatestParameters,
    CryptocurrencyTrendingMostVisitedParameters,
    CryptocurrencyTrendingGainersLosersParameters,
)


class CoinmarketcapService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://pro-api.coinmarketcap.com"

    async def _make_request(self, endpoint: str, params: dict | None = None) -> dict:
        """Make a request to the Coinmarketcap API with proper error handling."""
        if params is None:
            params = {}
        
        # Remove None values from params
        params = {k: v for k, v in params.items() if v is not None}
        
        # Convert list parameters to comma-separated strings
        for key, value in params.items():
            if isinstance(value, list):
                params[key] = ",".join(map(str, value))

        async with aiohttp.ClientSession() as session:
            url = f"{self.base_url}{endpoint}"
            try:
                async with session.get(
                    url,
                    params=params,
                    headers={
                        "X-CMC_PRO_API_KEY": self.api_key,
                        "Accept": "application/json",
                    },
                ) as response:
                    if not response.ok:
                        error_data = await response.json()
                        raise Exception(
                            f"Coinmarketcap API Error: {response.status} - "
                            f"{error_data.get('status', {}).get('error_message', response.reason)}"
                        )
                    
                    data = await response.json()
                    return data["data"]
            except aiohttp.ClientError as e:
                raise Exception(f"Failed to make request to Coinmarketcap API: {str(e)}")

    @Tool({
        "description": "Fetch the latest cryptocurrency listings with market data including price, market cap, volume, and other key metrics",
        "parameters_schema": CryptocurrencyListingsParameters
    })
    async def get_cryptocurrency_listings(self, parameters: dict):
        """Get the latest cryptocurrency listings."""
        return await self._make_request("/v1/cryptocurrency/listings/latest", parameters)

    @Tool({
        "description": "Get the latest market quotes for one or more cryptocurrencies, including price, market cap, and volume in any supported currency",
        "parameters_schema": CryptocurrencyQuotesLatestParameters
    })
    async def get_cryptocurrency_quotes(self, parameters: dict):
        """Get cryptocurrency quotes for specific coins."""
        return await self._make_request("/v2/cryptocurrency/quotes/latest", parameters)

    @Tool({
        "description": "Fetch the latest cryptocurrency exchange listings with market data including trading volume, number of markets, and liquidity metrics",
        "parameters_schema": ExchangeListingsParameters
    })
    async def get_exchange_listings(self, parameters: dict):
        """Get the latest exchange listings."""
        return await self._make_request("/v1/exchange/listings/latest", parameters)

    @Tool({
        "description": "Get the latest market data for one or more exchanges including trading volume, number of markets, and other exchange-specific metrics",
        "parameters_schema": ExchangeQuotesLatestParameters
    })
    async def get_exchange_quotes(self, parameters: dict):
        """Get exchange quotes for specific exchanges."""
        return await self._make_request("/v1/exchange/quotes/latest", parameters)

    @Tool({
        "description": "Fetch the latest cryptocurrency news, articles, and market analysis content from trusted sources",
        "parameters_schema": ContentLatestParameters
    })
    async def get_content(self, parameters: dict):
        """Get the latest cryptocurrency content and news."""
        return await self._make_request("/v1/content/latest", parameters)

    @Tool({
        "description": "Get a mapping of all cryptocurrencies with unique CoinMarketCap IDs, including active and inactive assets",
        "parameters_schema": CryptocurrencyMapParameters
    })
    async def get_cryptocurrency_map(self, parameters: dict):
        """Get the cryptocurrency ID map."""
        return await self._make_request("/v1/cryptocurrency/map", parameters)

    @Tool({
        "description": "Get the latest OHLCV (Open, High, Low, Close, Volume) values for cryptocurrencies",
        "parameters_schema": CryptocurrencyOHLCVLatestParameters
    })
    async def get_cryptocurrency_ohlcv(self, parameters: dict):
        """Get OHLCV data for cryptocurrencies."""
        return await self._make_request("/v2/cryptocurrency/ohlcv/latest", parameters)

    @Tool({
        "description": "Get the latest trending cryptocurrencies based on CoinMarketCap user activity",
        "parameters_schema": CryptocurrencyTrendingLatestParameters
    })
    async def get_cryptocurrency_trending(self, parameters: dict):
        """Get trending cryptocurrencies."""
        return await self._make_request("/cryptocurrency/trending/latest", parameters)

    @Tool({
        "description": "Get the most visited cryptocurrencies on CoinMarketCap over a specified time period",
        "parameters_schema": CryptocurrencyTrendingMostVisitedParameters
    })
    async def get_cryptocurrency_most_visited(self, parameters: dict):
        """Get most visited cryptocurrencies."""
        return await self._make_request("/cryptocurrency/trending/most-visited", parameters)

    @Tool({
        "description": "Get the top gaining and losing cryptocurrencies based on price changes over different time periods",
        "parameters_schema": CryptocurrencyTrendingGainersLosersParameters
    })
    async def get_cryptocurrency_gainers_losers(self, parameters: dict):
        """Get cryptocurrency gainers and losers."""
        return await self._make_request("/cryptocurrency/trending/gainers-losers", parameters)
