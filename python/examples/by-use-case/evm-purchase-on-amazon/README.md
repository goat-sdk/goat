# EVM Purchase on Amazon with Crossmint

This example demonstrates how to use the GOAT SDK with Crossmint's headless checkout to purchase items from Amazon on an EVM blockchain.

## Setup

### Prerequisites

- Python 3.10+
- Poetry
- Crossmint API key
- EVM wallet private key
- RPC provider URL

### Environment Variables

Create a `.env` file with the following variables:

```
CROSSMINT_API_KEY=your_crossmint_api_key
WALLET_PRIVATE_KEY=0x...your_wallet_private_key
RPC_PROVIDER_URL=your_rpc_provider_url
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
