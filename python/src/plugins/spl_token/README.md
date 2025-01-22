# spl-token Plugin for GOAT SDK

A plugin for the GOAT SDK that provides spl-token functionality.

## Installation

```bash
# Install the plugin
poetry add goat-sdk-plugin-spl-token

# Install required wallet dependency
poetry add goat-sdk-wallet-solana
```

## Usage

```python
from goat_plugins.spl-token import spl_token, SplTokenPluginOptions

# Initialize the plugin
options = SplTokenPluginOptions(
    api_key="your-api-key"
)
plugin = spl_token(options)
```

## Features

- Example query functionality
- Example action functionality
- Solana chain support

## License

This project is licensed under the terms of the MIT license.
