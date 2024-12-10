# Lit Protocol Wallet Example with LangChain

This example demonstrates how to:
1. Set up Lit Protocol resources (capacity credits, PKP, wrapped key)
2. Create a Lit wallet client
3. Use it with LangChain to interact with EVM chains

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Create a `.env` file based on `.env.template`:
```bash
cp .env.template .env
```

3. Fill in the environment variables:
- `RPC_PROVIDER_URL`: Your EVM RPC provider URL (e.g., Sepolia testnet)
- `OPENAI_API_KEY`: Your OpenAI API key for LangChain
- `WALLET_ADDRESS`: Your wallet address that will own the PKP

## How it Works

1. Sets up Lit Protocol resources:
   - Mints capacity credits for computation
   - Mints a new PKP (Programmable Key Pair)
   - Generates a wrapped key with PKP ownership condition

2. Creates a Lit wallet client:
   - Obtains session signatures using PKP ownership
   - Initializes the wallet with the wrapped key

3. Sets up LangChain:
   - Creates an agent with the wallet client
   - Adds ERC20 and ETH transfer plugins

4. Executes operations:
   - Uses the LangChain agent to query USDC balance

## Running the Example

```bash
pnpm tsx index.ts
```

This will:
1. Set up all necessary Lit Protocol resources
2. Create the wallet client
3. Query your USDC balance using the LangChain agent

## Important Notes

- The example uses the Sepolia testnet by default
- Capacity credits are required for using Lit Actions
- The PKP will be owned by the wallet address you provide
- The wrapped key is configured to only be usable by the PKP owner