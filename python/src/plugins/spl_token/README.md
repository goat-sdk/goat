# SPL Token Plugin for GOAT SDK

A plugin for the GOAT SDK that provides functionality for interacting with Solana Program Library (SPL) tokens on the Solana blockchain.

## Installation

```bash
# Install the plugin
poetry add goat-sdk-plugin-spl-tokens

# Install required wallet dependency
poetry add goat-sdk-wallet-solana
```

## Usage

```python
from goat_plugins.spl_token import spl_token, SplTokenPluginOptions

# Initialize the plugin
options = SplTokenPluginOptions(
    rpc_url="${RPC_PROVIDER_URL}"  # Your Solana RPC URL
)
plugin = spl_token(options)

# Get token account info
token_info = await plugin.get_token_account_info(
    token_address="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",  # USDC
    wallet_address="your_wallet_address"
)

# Transfer tokens
transfer = await plugin.transfer(
    token_address="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",  # USDC
    recipient="recipient_wallet_address",
    amount=1000000,  # 1 USDC (6 decimals)
)

# Create token account
new_account = await plugin.create_token_account(
    token_mint="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",  # USDC
    owner="owner_wallet_address"
)
```

## Features

- Token Account Management:
  - Create token accounts
  - Close token accounts
  - Get account information
  - Get token balances
  
- Token Operations:
  - Transfer tokens
  - Approve token delegation
  - Revoke token delegation
  - Burn tokens
  
- Token Mint Operations:
  - Create token mints
  - Mint new tokens
  - Set mint authority
  - Freeze/thaw accounts
  
- Advanced Features:
  - Multi-signature support
  - Associated token accounts
  - Token program v2 support
  - Metadata program integration
  
- Network Support:
  - Solana Mainnet
  - Solana Testnet
  - Solana Devnet

## License

This project is licensed under the terms of the MIT license.
