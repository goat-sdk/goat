# Langchain web3 Example

This example demonstrates the usage of different wallet types with Crossmint's API:
- Smart EVM Wallet
- Custodial Solana Wallet
- Smart Solana Wallet

## Setup

Copy the `.env.template` and populate with your values:

```
cp .env.template .env
```

Required environment variables:
- `CROSSMINT_API_KEY`: Your Crossmint API key
- `CROSSMINT_USER_EMAIL`: Email for wallet creation
- `SOLANA_RPC_ENDPOINT`: Solana RPC endpoint (defaults to Devnet)
- `CROSSMINT_BASE_URL`: Crossmint API base URL

Install dependencies:

```
poetry install --no-root
```

## Usage

Run Smart EVM Wallet example:
```
poetry run python smart_evm_wallet_example.py
```

Run Custodial Solana Wallet example:
```
poetry run python custodial_solana_wallet_example.py
```

Run Smart Solana Wallet example:
```
poetry run python solana_smart_wallet_example.py
```
