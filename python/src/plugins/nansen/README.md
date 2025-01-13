# GOAT SDK Nansen Plugin

This plugin provides tools for interacting with the Nansen API, allowing you to:
- Get token details and trades
- Retrieve NFT collection details and trades
- Access smart money wallet analysis
- Get trading signals based on on-chain data

## Installation

```bash
pip install goat-sdk-plugin-nansen
```

## Usage

```python
from goat_plugins.nansen import nansen, NansenPluginOptions

# Initialize the plugin with your API key
plugin = nansen(NansenPluginOptions(
    api_key="your-nansen-api-key"
))

## Features

- Token Analysis:
  - Get detailed token information
  - Track token trading activity
  
- NFT Analytics:
  - Fetch NFT collection details
  - Monitor NFT trading activity
  
- Smart Money Tracking:
  - Analyze smart money wallet behavior
  - Track token flows
  
- Trading Signals:
  - Get trading signals based on on-chain data
  - Filter by date ranges and specific tokens
