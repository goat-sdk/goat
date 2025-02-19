# Vercel AI with Solana Example

This example demonstrates how to use GOAT with Vercel AI SDK to create an interactive DeFi assistant for the Solana ecosystem. It provides a natural language interface for trading, token swaps, and market analysis using multiple Solana protocols and data providers.

## Overview
The example showcases:
- Jupiter DEX integration for token swaps
- SPL token operations
- Coingecko price data integration
- PumpFun protocol interaction
- Interactive chat interface
- Natural language DeFi operations
- Solana blockchain integration

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Copy the `.env.template` and populate with your values:
```bash
cp .env.template .env
```

### Required Environment Variables:
- `OPENAI_API_KEY`: Your OpenAI API key for the AI model
  - Get from: https://platform.openai.com/api-keys
  - Format: "sk-" followed by random characters
- `SOLANA_PRIVATE_KEY`: Your Solana wallet's private key
  - Format: Base58 encoded string
  - ⚠️ Never share or commit your private key
- `SOLANA_RPC_URL`: Solana RPC endpoint URL
  - Format: Full URL (e.g., https://api.mainnet-beta.solana.com)
  - See: [Environment Variables Guide](../../../docs/environment-variables.mdx)
- `COINGECKO_API_KEY`: Your Coingecko API key for market data
  - Get from: https://www.coingecko.com/api/pricing
  - Format: 32-character string

For detailed information about environment variable formats and how to obtain API keys, see the [Environment Variables Guide](../../../docs/environment-variables.mdx).

## Usage

1. Run the interactive chat:
```bash
npx ts-node index.ts
```

2. Example interactions:
```
# Token Operations
Swap 1 SOL for USDC
Check my SPL token balances
Send 5 USDC to address...

# Market Analysis
Get price of SOL
Show market stats for BONK
Check trading volume

# DeFi Operations
Find best swap route
Execute trade on Jupiter
Interact with PumpFun
```

3. Understanding responses:
   - Market data and analysis
   - Transaction confirmations
   - Protocol interactions
   - Trading suggestions
   - Error messages
