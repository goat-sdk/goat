# Vercel AI with Solana Example

This example demonstrates how to use GOAT with Vercel AI SDK to create an interactive DeFi assistant for the Solana ecosystem. It provides a natural language interface for trading, token swaps, and market analysis using multiple Solana protocols and data providers.

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
- `SOLANA_PRIVATE_KEY`: Your Solana wallet's private key (Base58 encoded)
- `SOLANA_RPC_URL`: Solana RPC endpoint URL
- `COINGECKO_API_KEY`: Your Coingecko API key for market data

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
