# GOAT SDK Dexscreener Plugin

This plugin provides tools for interacting with the Dexscreener API, allowing you to:
- Fetch pairs by chainId and pairId
- Search for DEX pairs matching a query string
- Get all DEX pairs for given token addresses

## Installation

```bash
pip install goat-sdk-plugin-dexscreener
```

## Usage

```python
from goat_plugins.dexscreener import dexscreener, DexscreenerPluginOptions

# Initialize the plugin
plugin = dexscreener(DexscreenerPluginOptions())
```
