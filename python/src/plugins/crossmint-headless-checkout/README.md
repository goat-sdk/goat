# crossmint-headless-checkout Plugin for GOAT SDK

A plugin for the GOAT SDK that provides crossmint-headless-checkout functionality.

## Installation

```bash
# Install the plugin
poetry add goat-sdk-plugin-crossmint-headless-checkout

# Install required wallet dependency
poetry add goat-sdk-wallet-evm
```

## Usage

```python
from goat_plugins.crossmint-headless-checkout import crossmint_headless_checkout, CrossmintHeadlessCheckoutPluginOptions

# Initialize the plugin
options = CrossmintHeadlessCheckoutPluginOptions(
    api_key="your-api-key"
)
plugin = crossmint_headless_checkout(options)
```

## Features

- Example query functionality
- Example action functionality
- EVM chain support

## License

This project is licensed under the terms of the MIT license.
