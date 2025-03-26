# Solana Purchase on Amazon with Crossmint

This example demonstrates how to use the GOAT SDK with Crossmint's headless checkout to purchase items from Amazon on the Solana blockchain.

## Setup

### Prerequisites

- Python 3.10+
- Poetry
- Crossmint API key
- Solana wallet seed
- Solana RPC endpoint

### Environment Variables

Create a `.env` file with the following variables:

```
CROSSMINT_API_KEY=your_crossmint_api_key
SOLANA_WALLET_SEED=your_base58_encoded_wallet_seed
SOLANA_RPC_ENDPOINT=your_solana_rpc_endpoint
```

### Installation

```bash
poetry install
```

## Usage

Start the assistant:

```bash
poetry run python example.py
```

You can now interact with the assistant. Try asking it to purchase Amazon items using Crossmint, for example:

```
I want to buy an Amazon product using Crossmint. The product ID is B09XXXX
```

The assistant will guide you through the purchase process using the Crossmint headless checkout.
