# 1inch Plugin for GOAT SDK

A plugin for the GOAT SDK that provides 1inch DEX aggregator functionality.

## Installation

```bash
# Install the plugin
poetry add goat-sdk-plugin-1inch

# Install required wallet dependency
poetry add goat-sdk-wallet-evm
```

## Usage

```python
from goat_plugins.inch1 import inch1, Inch1PluginOptions

# Initialize the plugin
options = Inch1PluginOptions(
    api_key="${INCH1_API_KEY}"  # Optional: API key for higher rate limits
)
plugin = inch1(options)

# Get swap quote
quote = await plugin.get_swap_quote(
    chain_id=1,  # Ethereum mainnet
    from_token_address="0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",  # ETH
    to_token_address="0x6B175474E89094C44Da98b954EedeAC495271d0F",  # DAI
    amount="1000000000000000000"  # 1 ETH in wei
)
```

## Features

- DEX aggregation across multiple chains
- Swap quote functionality
- Token price discovery
- Supported chains:
  - Ethereum
  - Polygon
  - BSC
  - Arbitrum
  - Optimism
  - Avalanche
  - Gnosis Chain
  - Base

## License

This project is licensed under the terms of the MIT license.
