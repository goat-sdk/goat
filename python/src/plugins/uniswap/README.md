# Uniswap Plugin for GOAT SDK

A plugin for the GOAT SDK that provides Uniswap DEX functionality for token swaps and liquidity operations.

## Installation

```bash
# Install the plugin
poetry add goat-sdk-plugin-uniswap

# Install required dependencies
poetry add goat-sdk-wallet-evm
poetry add goat-sdk-plugin-erc20
```

## Usage

```python
from goat_plugins.uniswap import uniswap, UniswapPluginOptions

# Initialize the plugin
options = UniswapPluginOptions(
    api_key="${UNISWAP_API_KEY}",  # Optional: API key for higher rate limits
    rpc_url="${RPC_PROVIDER_URL}"   # Your EVM RPC provider URL
)
plugin = uniswap(options)

# Get token price
price = await plugin.get_token_price(
    token_address="0x6B175474E89094C44Da98b954EedeAC495271d0F",  # DAI
    chain_id=1  # Ethereum mainnet
)

# Get swap quote
quote = await plugin.get_swap_quote(
    chain_id=1,
    token_in="0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",   # WETH
    token_out="0x6B175474E89094C44Da98b954EedeAC495271d0F",  # DAI
    amount="1000000000000000000",  # 1 WETH in wei
    slippage=50  # 0.5% slippage tolerance
)
```

## Features

- Token price discovery
- Swap quote generation
- Token swap execution
- Liquidity pool information
- Position management
- Supported chains:
  - Ethereum
  - Polygon
  - Arbitrum
  - Optimism
  - Base
  - All Uniswap v3 supported networks

## License

This project is licensed under the terms of the MIT license.
