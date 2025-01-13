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

# Example: Get token details
async def get_token_info():
    result = await plugin.get_token_details({
        "address": "0x1234..."  # Token contract address
    })
    print(result)

# Example: Get NFT trades
async def get_nft_trading_history():
    result = await plugin.get_nft_trades({
        "token_address": "0x1234...",  # NFT contract address
        "nft_id": "1",                 # Token ID
        "start_date": "2024-01-01",
        "end_date": "2024-01-31"
    })
    print(result)

# Example: Get smart money flows
async def get_smart_money_flows():
    result = await plugin.get_smart_money_status({
        "start_date": "2024-01-01",
        "end_date": "2024-01-31",
        "token_address": "0x1234..."  # Optional token address
    })
    print(result)

# Example: Get trading signals
async def get_trading_signals():
    result = await plugin.get_trading_signal({
        "start_date": "2024-01-01",
        "end_date": "2024-01-31"
    })
    print(result)
```

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

## Configuration

The plugin requires a Nansen API key. You can obtain one by:
1. Creating an account at [Nansen](https://www.nansen.ai)
2. Subscribing to the API service
3. Generating an API key in your dashboard

## Development

To set up the development environment:

```bash
# Clone the repository
git clone https://github.com/goat-sdk/goat.git
cd goat/python/src/plugins/nansen

# Install dependencies using Poetry
poetry install

# Run tests
poetry run pytest

# Run linting
poetry run ruff check .
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
