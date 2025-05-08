import aiohttp
from typing import Dict, Any, Union

from goat.classes.wallet_client_base import WalletClientBase
from goat.decorators.tool import Tool
from goat_wallets.evm.evm_wallet_client import EVMWalletClient
from goat_wallets.solana.wallet import SolanaWalletClient
from goat.types import Token

from .parameters import GetTokenInfoByTickerParameters

# Global mapping of CoinGecko platform identifiers to chain IDs
PLATFORM_TO_CHAIN_ID = {
    # EVM chains
    "ethereum": 1,
    "polygon-pos": 137,
    "optimistic-ethereum": 10,
    "arbitrum-one": 42161,
    "base": 8453,
    "celo": 42220,
    "avalanche": 43114,
    "binance-smart-chain": 56,
    "fantom": 250,
    "cronos": 25,
    "palm": 11297108109,
    "metis-andromeda": 1088,
    "aurora": 1313161554,
    "moonbeam": 1284,
    "moonriver": 1285,
    "arbitrum-nova": 42170,
    "harmony-shard-0": 1666600000,
    "kava": 2222,
    "gnosis": 100,
    "zksync": 324,
    "linea": 59144,
    "zksyncerabetatest": 300,
    "iotex": 4689,
    "oasis": 42262,
    "conflux": 1030,
    "boba": 288,
    "astar": 592,
    "evmos": 9001,
    "dogechain": 2000,
    "klaytn": 8217,
    "fuse": 122,
    
    # Non-EVM chains
    "solana": "solana",
    "tron": "tron",
    "stellar": "stellar",
    "algorand": "algorand",
    "aptos": "aptos",
    "sui": "sui",
    "near-protocol": "near",
    "hedera-hashgraph": "hedera",
    "polkadot": "polkadot",
    "cardano": "cardano",
    "flow": "flow",
    "elrond": "elrond",
    "tezos": "tezos",
    "cosmos": "cosmos",
    "osmosis": "osmosis",
    "stacks": "stacks",
    "ronin": "ronin",
    "wax": "wax",
    "waves": "waves",
    "zilliqa": "zilliqa",
    "secret": "secret",
    "chiliz": "chiliz",
    "thorchain": "thorchain",
    "canto": "canto",
    "hoo-smart-chain": "hoo",
    "sora": "sora",
    "icon": "icon",
    "okex-chain": "okex",
    "kucoin-community-chain": "kucoin",
    "huobi-token": "huobi",
    "terra": "terra",
    "vechain": "vechain",
}


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
    })
    async def get_token_info_by_ticker(self, wallet_client: WalletClientBase, parameters: dict) -> Token:
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
                return wallet_client.get_token_info_by_ticker(ticker)
            
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
                return wallet_client.get_token_info_by_ticker(ticker)
            
            # Handle different wallet client types to get chain_id
            if isinstance(wallet_client, EVMWalletClient):
                chain = wallet_client.get_chain()
                chain_id = chain["id"]
            elif isinstance(wallet_client, SolanaWalletClient):
                chain_id = "solana"
            else:
                # For other wallet types, use fallback mechanism
                return wallet_client.get_token_info_by_ticker(ticker)
            
            contract_address = ""
            for platform, address in token_details.get("platforms", {}).items():
                if PLATFORM_TO_CHAIN_ID.get(platform) == chain_id and address:
                    contract_address = address
                    break
            
            if not contract_address:
                return wallet_client.get_token_info_by_ticker(ticker)
            
            return {
                "symbol": best_match["symbol"].upper(),
                "contractAddress": contract_address,
                "decimals": 18,  # Default to 18 as most ERC20 tokens use this (ideally would verify)
                "name": best_match["name"],
            }
        except Exception as e:
            return wallet_client.get_token_info_by_ticker(ticker)