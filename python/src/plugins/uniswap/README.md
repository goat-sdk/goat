# uniswap Plugin for GOAT SDK

A plugin for the GOAT SDK that provides uniswap functionality.

## Installation

```bash
# Install the plugin
poetry add goat-sdk-plugin-uniswap

# Install required wallet dependency
poetry add goat-sdk-wallet-evm
```

## Usage

```python
from goat_plugins.uniswap import uniswap, UniswapPluginOptions

# Initialize the plugin
options = UniswapPluginOptions(
    api_key="your-api-key"
)
plugin = uniswap(options)
```

## Features

- Example query functionality
- Example action functionality
- EVM chain support

## License

This project is licensed under the terms of the MIT license.
