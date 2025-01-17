# jupiter Plugin for GOAT SDK

A plugin for the GOAT SDK that provides jupiter functionality.

## Installation

```bash
# Install the plugin
poetry add goat-sdk-plugin-jupiter

# Install required wallet dependency
poetry add goat-sdk-wallet-solana
```

## Usage

```python
from goat_plugins.jupiter import jupiter, JupiterPluginOptions

# Initialize the plugin
options = JupiterPluginOptions(
    api_key="your-api-key"
)
plugin = jupiter(options)
```

## Features

- Example query functionality
- Example action functionality
- Solana chain support

## License

This project is licensed under the terms of the MIT license.
