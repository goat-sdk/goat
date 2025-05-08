# Token Discovery with CoinGecko

This example demonstrates how to use the CoinGecko Token Discovery plugin to dynamically discover token information for both EVM and Solana wallets.

## Features

- Dynamically discover token information using CoinGecko API
- Fallback to hardcoded token lists if API fails
- Works with both EVM and Solana wallets
- Retrieves token details including contract addresses, decimals, and names

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Add your CoinGecko API key to the `.env` file:
   ```
   COINGECKO_API_KEY=your_coingecko_api_key_here
   ```

## Running the Example

```bash
pnpm start
```

This will:
1. Create an EVM wallet client
2. Create a Solana wallet client
3. Initialize the CoinGecko Token Discovery plugin
4. Look up several tokens on both chains
5. Display the token information retrieved

## How It Works

The example demonstrates how the plugin overrides the default token discovery methods in the wallet clients:

1. For EVM wallets, it overrides `get_token_info_by_ticker`
2. For Solana wallets, it overrides `get_token_info_by_symbol`

When a token lookup is requested, the plugin:
1. Searches for the token on CoinGecko
2. Retrieves detailed token information including contract addresses
3. Returns the token information in the format expected by the wallet
4. Falls back to the wallet's hardcoded token list if the API fails or the token isn't found

This allows agents to work with a much wider range of tokens than just those hardcoded in the wallet implementations.
