# OpenSea Plugin for GOAT SDK

A plugin for the GOAT SDK that provides OpenSea NFT marketplace functionality for querying NFT collections, sales, and metadata.

## Installation

```bash
# Install the plugin
poetry add goat-sdk-plugin-opensea

# Install required wallet dependency
poetry add goat-sdk-wallet-evm
```

## Usage

```python
from goat_plugins.opensea import opensea, OpenSeaPluginOptions

# Initialize the plugin
options = OpenSeaPluginOptions(
    api_key="${ETHERSCAN_API}"  # Your OpenSea API key
)
plugin = opensea(options)

# Get NFT collection statistics
stats = await plugin.get_nft_collection_statistics(
    collection_slug="doodles-official",  # Example collection
    chain="ethereum"  # Specify the chain
)

# Get recent NFT sales
sales = await plugin.get_nft_sales(
    collection_slug="doodles-official",
    chain="ethereum",
    limit=10  # Number of recent sales to fetch
)

# Get NFT metadata
metadata = await plugin.get_nft_metadata(
    contract_address="0x8a90CAb2b38dba80c64b7734e58Ee1dB38B8992e",  # Doodles contract
    token_id="1234",
    chain="ethereum"
)
```

## Features

- NFT collection statistics
- Recent sales tracking
- NFT metadata retrieval
- Collection floor price tracking
- Supported chains:
  - Ethereum
  - Polygon
  - Arbitrum
  - Optimism
  - Base
  - All OpenSea-supported EVM chains

## License

This project is licensed under the terms of the MIT license.
