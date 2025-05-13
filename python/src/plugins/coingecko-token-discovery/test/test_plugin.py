import os
import asyncio
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from goat_plugins.coingecko_token_discovery import coingecko_token_discovery, CoinGeckoTokenDiscoveryPluginOptions
from goat_plugins.coingecko_token_discovery.service import CoinGeckoTokenDiscoveryService

# Mock wallet client for testing
class MockEVMWalletClient:
    def get_chain(self):
        return {"id": "ethereum", "name": "Ethereum"}
    
    async def get_token_info_by_ticker(self, params):
        ticker = params["ticker"]
        print(f"Fallback to wallet's get_token_info_by_ticker for {ticker}")
        return {"ticker": ticker, "address": f"0xmock{ticker}", "decimals": 18, "name": f"Mock {ticker}"}

class MockSolanaWalletClient:
    def get_chain(self):
        return {"id": "solana", "name": "Solana"}
    
    async def get_token_info_by_ticker(self, params):
        ticker = params["ticker"]
        print(f"Fallback to wallet's get_token_info_by_ticker for {ticker}")
        return {"ticker": ticker, "address": f"mock{ticker}", "decimals": 9, "name": f"Mock {ticker}"}

async def test_evm_token_discovery():
    print("\n=== Testing EVM Token Discovery ===")
    
    # Initialize mock wallet client
    wallet_client = MockEVMWalletClient()
    
    # Initialize CoinGecko service
    service = CoinGeckoTokenDiscoveryService(os.environ.get("COINGECKO_API_KEY", ""))
    
    # Test with valid token
    print("\nTesting with valid token (BTC):")
    try:
        token_info = await service.get_token_info_by_ticker(wallet_client, {"ticker": "BTC"})
        print(f"BTC token info: {token_info}")
    except Exception as e:
        print(f"Error getting token info: {str(e)}")
    
    # Test with invalid token to trigger fallback
    print("\nTesting with invalid token (NONEXISTENT):")
    try:
        token_info = await service.get_token_info_by_ticker(wallet_client, {"ticker": "NONEXISTENT"})
        print(f"NONEXISTENT token info: {token_info}")
    except Exception as e:
        print(f"Error getting token info: {str(e)}")

async def test_solana_token_discovery():
    print("\n=== Testing Solana Token Discovery ===")
    
    # Initialize mock wallet client
    wallet_client = MockSolanaWalletClient()
    
    # Initialize CoinGecko service
    service = CoinGeckoTokenDiscoveryService(os.environ.get("COINGECKO_API_KEY", ""))
    
    # Test with valid token
    print("\nTesting with valid token (BTC):")
    try:
        token_info = await service.get_token_info_by_ticker(wallet_client, {"ticker": "BTC"})
        print(f"BTC token info: {token_info}")
    except Exception as e:
        print(f"Error getting token info: {str(e)}")
    
    # Test with invalid token to trigger fallback
    print("\nTesting with invalid token (NONEXISTENT):")
    try:
        token_info = await service.get_token_info_by_ticker(wallet_client, {"ticker": "NONEXISTENT"})
        print(f"NONEXISTENT token info: {token_info}")
    except Exception as e:
        print(f"Error getting token info: {str(e)}")

async def main():
    print("Testing CoinGecko Token Discovery Plugin")
    print("=======================================")
    
    await test_evm_token_discovery()
    await test_solana_token_discovery()

if __name__ == "__main__":
    asyncio.run(main())
