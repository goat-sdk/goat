## Goat SDK Solana Wallet

A Python implementation of a Solana wallet, mirroring the existing TypeScript Solana wallet.

## Installation

```bash
poetry add goat-sdk-wallet-solana
```

## Usage

```python
from solana.rpc.api import Client as SolanaClient
from solana.keypair import Keypair
from goat_wallets.solana import solana_keypair

# Initialize Solana client and keypair
client = SolanaClient("https://api.mainnet-beta.solana.com")
keypair = Keypair()  # Or load an existing keypair

# Create wallet instance
wallet = solana_keypair(client, keypair)

# Get wallet address
address = wallet.get_address()

# Check balance
balance = wallet.balance_of(address)

# Sign message
signature = wallet.sign_message("Hello, Solana!")

# Send transaction
transaction = {
    "instructions": [],  # Add your transaction instructions
    "address_lookup_table_addresses": None,  # Optional lookup tables
    "accounts_to_sign": None,  # Optional additional signers
}
result = wallet.send_transaction(transaction)
```
