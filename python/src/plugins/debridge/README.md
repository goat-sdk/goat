# deBridge Plugin for GOAT SDK

A plugin for the GOAT SDK that provides access to deBridge Liquidity Network (DLN) functionality.

## Installation

```bash
# Install the plugin
poetry add goat-sdk-plugin-debridge


```

## Usage

```python
from goat_plugins.debridge import debridge, DebridgePluginOptions

# Initialize the plugin
options = DebridgePluginOptions()
plugin = debridge(options)

# Get order data
order_data = await plugin.get_order_data(
    id="0x81fbb0ed8209eb57d084aee1986c00e597c1e1ec6bb93bc4dbe97266ca0398fb"
)

# Get supported chains
chains = await plugin.get_supported_chains()

# Get order IDs
order_IDs = await plugin.get_order_IDs(
    hash="0xbe9071de34de9bd84a52039bc4bc6c8229d4bd65127d034ffc66b600d8260276" # Hash of the creation transaction
)
```

## Features

- DLN
    - Create order transaction `create_order_transaction`
    - Get order data `get_order_data`
    - Get order status `get_order_status`
    - Get order IDs `get_order_IDs`
    - Cancel order `cancel_order`
    - Cancel external call `cancel_external_call`
- Utils
    - Get supported chains `get_supported_chains`
    - Get token list `get_token_list`
- Single Chain Swap
    - Estimation `single_chain_swap_estimation`
    - Transaction `single_chain_swap_transaction`

### DLN Swagger Docs
The deBridge plugin tools is a 1-to-1 representation of the DLN API.
You can access the [deBridge Swagger docs](https://dln.debridge.finance/v1.0) page for more information about the various parameters.

## License

This project is licensed under the terms of the MIT license.
