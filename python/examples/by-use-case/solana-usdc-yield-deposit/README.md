# Solana USDC Yield Deposit Example

This example demonstrates how to use the GOAT SDK with the Lulo plugin to deposit USDC into Lulo's yield platform on Solana.

## What is Lulo?

Lulo is a yield-generating platform on Solana that allows users to deposit USDC and earn yield. This example shows how to interact with Lulo's services using a language model agent.

## Prerequisites

- Python 3.12+
- Poetry package manager
- A Solana wallet with USDC tokens
- Access to a Solana RPC endpoint

## Setup

1. Install dependencies using Poetry:

```bash
# Navigate to the example directory
cd python/examples/by-use-case/solana-usdc-yield-deposit

# Install dependencies with Poetry
poetry install
```

2. Create a `.env` file in the same directory with the following variables:

```
# OpenAI API Key for the language model
OPENAI_API_KEY=your_openai_api_key

# Solana Wallet Configuration
SOLANA_WALLET_SEED=your_base58_encoded_private_key
SOLANA_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
```

## Running the Example

Run the example with Poetry:

```bash
poetry run python example.py
```

Once running, you can interact with the assistant. Try commands like:

- "Deposit 5 USDC into Lulo"
- "What can I do with Lulo?"

## How It Works

This example:

1. Sets up a Solana wallet using your private key
2. Initializes the Lulo plugin for the GOAT SDK
3. Creates a language model agent with the Lulo tools
4. Processes user requests to interact with the Lulo platform
5. Handles USDC deposits via Lulo's API

## Important Notes

- Make sure your wallet has enough USDC for deposits
- Keep your wallet private key secure and never share it
- You may want to use a burner wallet for testing purposes 