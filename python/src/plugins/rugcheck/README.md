# GOAT SDK RugCheck Plugin

A Python implementation of the RugCheck plugin for the GOAT SDK, providing access to RugCheck's token analysis and verification services.

## Features

- Get recently detected tokens
- Get trending tokens in the last 24h
- Get most voted tokens in the last 24h
- Get recently verified tokens
- Generate token report summaries

## Installation

```bash
poetry install
```

## Usage

```python
from goat_plugins.rugcheck import rugcheck, RugCheckPluginOptions

# Initialize the plugin
options = RugCheckPluginOptions(jwt_token="your_jwt_token")  # JWT token is optional
plugin = rugcheck(options)

# Example: Get recently detected tokens
async def get_recent_tokens():
    service = plugin.services[0]
    tokens = await service.get_recently_detected_tokens({})
    return tokens

# Example: Generate a token report
async def get_token_report(mint_address: str):
    service = plugin.services[0]
    report = await service.generate_token_report_summary({"mint": mint_address})
    return report
```

## Authentication

The plugin supports JWT token authentication. While optional, some endpoints may require authentication for full access.

## Rate Limiting

The plugin includes built-in handling for rate limits (HTTP 429 responses) from the RugCheck API.

## Development

- Python 3.9+
- Uses `aiohttp` for async HTTP requests
- Uses `pydantic` for parameter validation

## License

See the main GOAT SDK repository for license information.
