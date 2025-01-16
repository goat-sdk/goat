# 1inch Plugin for GOAT

This plugin provides integration with the 1inch API for the GOAT SDK.

## Features

- Get token balances and allowances for a wallet address on a specific chain

## Installation

```bash
pip install goat-plugin-1inch
```

## Usage

```python
from goat_plugins.inch1 import OneInchService

# Initialize the service with your API key
service = OneInchService(api_key="your_api_key")

# Get balances for a wallet
balances = await service.get_aggregated_balances({
    "wallet_address": "0x...",
    "chain_id": 1  # Ethereum mainnet
})
```

## Configuration

The plugin requires a 1inch API key to function. You can obtain one from the [1inch Developer Portal](https://portal.1inch.dev/).

Set your API key when initializing the service:

```python
service = OneInchService(api_key="your_api_key")
```

## Development

To set up the development environment:

1. Clone the repository
2. Install dependencies with Poetry:
   ```bash
   poetry install
   ```
3. Run tests:
   ```bash
   poetry run pytest
   ```
