# lulo Plugin for GOAT SDK

A plugin for the GOAT SDK that provides lulo functionality.

## Installation

```bash
# Install the plugin
poetry add goat-sdk-plugin-lulo

# Install required wallet dependency
poetry add goat-sdk-wallet-solana
```

## Usage

```python
from goat_plugins.lulo import lulo, LuloPluginOptions

# Initialize the plugin
options = LuloPluginOptions(
    api_key="your-api-key"
)
plugin = lulo(options)
```

## Features

- Example query functionality
- Example action functionality
- Solana chain support

## License

This project is licensed under the terms of the MIT license.
