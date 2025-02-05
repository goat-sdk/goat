# ERC20 Plugin for GOAT SDK

A plugin for the GOAT SDK that provides ERC20 token interaction functionality.

## Installation

```bash
# Install the plugin
poetry add goat-sdk-plugin-erc20

# Install required wallet dependency
poetry add goat-sdk-wallet-evm
```

## Usage

```python
from goat_plugins.erc20 import erc20, ERC20PluginOptions

# Initialize the plugin
options = ERC20PluginOptions(
    rpc_url="${RPC_PROVIDER_URL}"  # Your EVM RPC provider URL
)
plugin = erc20(options)

# Get token balance
balance = await plugin.balance_of(
    token_address="0x6B175474E89094C44Da98b954EedeAC495271d0F",  # DAI token
    wallet_address="0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
)

# Check allowance
allowance = await plugin.allowance(
    token_address="0x6B175474E89094C44Da98b954EedeAC495271d0F",  # DAI token
    owner="0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    spender="0x1111111254EEB25477B68fb85Ed929f73A960582"  # 1inch router
)
```

## Features

- Token balance checking
- Allowance management
- Token transfers
- Token approvals
- Supported chains:
  - Ethereum
  - Polygon
  - BSC
  - Arbitrum
  - Optimism
  - Avalanche
  - Base
  - Any EVM-compatible chain

## License

This project is licensed under the terms of the MIT license.
