# Superfluid Plugin for GOAT SDK

A plugin for the GOAT SDK that provides real-time token streaming and programmable cashflow functionality through the Superfluid Protocol.

## Installation

```bash
# Install the plugin
poetry add goat-sdk-plugin-superfluid

# Install required wallet dependency
poetry add goat-sdk-wallet-evm
```

## Usage

```python
from goat_plugins.superfluid import superfluid, SuperfluidPluginOptions

# Initialize the plugin
options = SuperfluidPluginOptions(
    rpc_url="${RPC_PROVIDER_URL}"  # Your EVM RPC URL
)
plugin = superfluid(options)

# Create a token stream
stream = await plugin.create_stream(
    chain_id=137,  # Polygon
    token_address="0xCAa7349CEA390F89641fe306D93591f87595dc1F",  # USDC.e
    recipient="recipient_address",
    flow_rate="385802469135802",  # 1000 tokens per month
)

# Get stream details
flow_info = await plugin.get_flow(
    chain_id=137,
    token_address="0xCAa7349CEA390F89641fe306D93591f87595dc1F",
    sender="sender_address",
    recipient="recipient_address"
)

# Manage index subscription
subscription = await plugin.update_subscription(
    chain_id=137,
    token_address="0xCAa7349CEA390F89641fe306D93591f87595dc1F",
    publisher="publisher_address",
    index_id=1,
    units=100
)
```

## Features

- Token Streaming:
  - Create and manage token streams
  - Real-time balance updates
  - Flow rate calculations
  - Stream statistics
  
- Pool Management:
  - Instant Distribution Agreements (IDA)
  - Pool membership control
  - Units management
  - Distribution calculations
  
- Advanced Features:
  - Super Agreements
  - Super Tokens
  - Batch call support
  - Stream automation
  
- Supported Networks:
  - Ethereum
  - Polygon
  - Arbitrum
  - Optimism
  - Avalanche
  - BSC
  - Base
  - All Superfluid-enabled chains

## License

This project is licensed under the terms of the MIT license.
