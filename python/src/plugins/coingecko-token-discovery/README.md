# CoinGecko Token Discovery Plugin (Python)

A GOAT SDK plugin that uses the CoinGecko API to dynamically discover token information for both EVM and Solana wallets.

## Features

- Dynamically discover token information using CoinGecko API
- Fallback to hardcoded token lists if API fails
- Works with both EVM and Solana wallets
- Retrieves token details including contract addresses, decimals, and names

## Installation

```bash
pip install goat-plugins-coingecko-token-discovery
```

## Usage

```python
from goat.wallets.evm import evm_key_pair
from goat_plugins.coingecko_token_discovery import coingecko_token_discovery, CoinGeckoTokenDiscoveryPluginOptions
import os
import asyncio

async def main():
    # Create an EVM wallet client
    wallet_client = evm_key_pair({
        "private_key": os.environ["WALLET_PRIVATE_KEY"],
        "chain": "mainnet",
        "rpc_url": os.environ["RPC_PROVIDER_URL"],
    })
    
    # Create the CoinGecko token discovery plugin
    plugin = coingecko_token_discovery(CoinGeckoTokenDiscoveryPluginOptions(
        api_key=os.environ["COINGECKO_API_KEY"]
    ))
    
    # Get the tools from the plugin
    tools = plugin.get_tools(wallet_client)
    
    # Find the token discovery tool
    get_token_info_tool = next((tool for tool in tools if tool.name == "get_token_info_by_ticker"), None)
    
    # Use the tool
    token_info = await get_token_info_tool.execute({"ticker": "USDC"})
    print(token_info)

if __name__ == "__main__":
    asyncio.run(main())
```

## How It Works

The plugin overrides the default token discovery methods in the wallet clients:

1. For EVM and Solana wallets, it overrides `get_token_info_by_ticker`

When a token lookup is requested, the plugin:
1. Searches for the token on CoinGecko
2. Retrieves detailed token information including contract addresses
3. Returns the token information in the format expected by the wallet
4. Falls back to the wallet's hardcoded token list if the API fails or the token isn't found

This allows agents to work with a much wider range of tokens than just those hardcoded in the wallet implementations.

## API Reference

### `coingecko_token_discovery(options)`

Creates a new instance of the CoinGecko Token Discovery plugin.

**Parameters:**
- `options` (CoinGeckoTokenDiscoveryPluginOptions):
  - `api_key` (str): Your CoinGecko API key

**Returns:**
- A plugin instance that can be used with GOAT SDK wallets
