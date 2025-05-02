import aiohttp
from typing import Dict, Any, Optional, Union

from goat.decorators.tool import Tool
from goat_wallets.evm.evm_wallet_client import EVMWalletClient
from goat_wallets.solana.wallet import SolanaWalletClient

from .parameters import GetTokenInfoByTickerParameters, GetTokenInfoBySymbolParameters


class CoinGeckoTokenDiscoveryService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.coingecko.com/api/v3"
        
    async def request(self, endpoint: str, params: Dict[str, Any] = {}) -> Dict[str, Any]:
        """Make a request to the CoinGecko API.
        
        Args:
            endpoint: The API endpoint to call
            params: Query parameters to include in the request
            
        Returns:
            The API response as JSON
        """
            
        params["x_cg_demo_api_key"] = self.api_key
        
        async with aiohttp.ClientSession() as session:
            url = f"{self.base_url}/{endpoint}"
            async with session.get(url, params=params) as response:
                if not response.ok:
                    raise Exception(f"CoinGecko API Error: {response.status} {await response.text()}")
                return await response.json()
    
    @Tool({
        "name": "get_token_info_by_ticker",
        "description": "Get information about a token by its ticker symbol using CoinGecko data.",
        "parameters_schema": GetTokenInfoByTickerParameters,
        "wallet_client": {"index": 1},
    })
    async def get_token_info_by_ticker(self, wallet_client: EVMWalletClient, parameters: dict) -> Dict[str, Any]:
        """Get token information by ticker symbol using CoinGecko data.
        
        Args:
            wallet_client: The EVM wallet client
            parameters: Parameters including the ticker symbol
            
        Returns:
            Token information
        """
        ticker = parameters.get("ticker", "")
        
        try:
            search_result = await self.request("search", {"query": ticker})
            
            if not search_result.get("coins") or len(search_result["coins"]) == 0:
                return await wallet_client.get_token_info_by_ticker({"ticker": ticker})
            
            exact_match = next(
                (coin for coin in search_result["coins"] if coin["symbol"].lower() == ticker.lower()),
                None
            )
            
            best_match = exact_match or search_result["coins"][0]
            
            token_details = await self.request(f"coins/{best_match['id']}", {
                "localization": "false",
                "tickers": "false",
                "market_data": "true",
                "community_data": "false",
                "developer_data": "false",
            })
            
            if not token_details or "platforms" not in token_details:
                return await wallet_client.get_token_info_by_ticker({"ticker": ticker})
            
            chain = wallet_client.get_chain()
            chain_id = chain["id"]
            
            platform_to_chain_id = {
                "ethereum": 1,
                "polygon-pos": 137,
                "optimistic-ethereum": 10,
                "arbitrum-one": 42161,
                "base": 8453,
            }
            
            contract_address = ""
            for platform, address in token_details.get("platforms", {}).items():
                if platform_to_chain_id.get(platform) == chain_id and address:
                    contract_address = address
                    break
            
            if not contract_address:
                return await wallet_client.get_token_info_by_ticker({"ticker": ticker})
            
            return {
                "symbol": best_match["symbol"].upper(),
                "contractAddress": contract_address,
                "decimals": 18,  # Default to 18 as most ERC20 tokens use this (ideally would verify)
                "name": best_match["name"],
            }
        except Exception as e:
            return await wallet_client.get_token_info_by_ticker({"ticker": ticker})
    
    @Tool({
        "name": "get_token_info_by_symbol",
        "description": "Get information about a token by its symbol using CoinGecko data.",
        "parameters_schema": GetTokenInfoBySymbolParameters,
        "wallet_client": {"index": 1},
    })
    async def get_token_info_by_symbol(self, wallet_client: SolanaWalletClient, parameters: dict) -> Dict[str, Any]:
        """Get token information by symbol using CoinGecko data.
        
        Args:
            wallet_client: The Solana wallet client
            parameters: Parameters including the symbol
            
        Returns:
            Token information
        """
        symbol = parameters.get("symbol", "")
        
        try:
            search_result = await self.request("search", {"query": symbol})
            
            if not search_result.get("coins") or len(search_result["coins"]) == 0:
                return await wallet_client.get_token_info_by_symbol({"symbol": symbol})
            
            exact_match = next(
                (coin for coin in search_result["coins"] if coin["symbol"].lower() == symbol.lower()),
                None
            )
            
            best_match = exact_match or search_result["coins"][0]
            
            token_details = await self.request(f"coins/{best_match['id']}", {
                "localization": "false",
                "tickers": "false",
                "market_data": "true",
                "community_data": "false",
                "developer_data": "false",
            })
            
            if not token_details or "platforms" not in token_details:
                return await wallet_client.get_token_info_by_symbol({"symbol": symbol})
            
            mint_address = token_details.get("platforms", {}).get("solana")
            
            if not mint_address:
                return await wallet_client.get_token_info_by_symbol({"symbol": symbol})
            
            return {
                "symbol": best_match["symbol"].upper(),
                "mintAddress": mint_address,
                "decimals": 9,  # Default to 9 for Solana tokens, would be better to get actual decimals
                "name": best_match["name"],
            }
        except Exception as e:
            return await wallet_client.get_token_info_by_symbol({"symbol": symbol})
