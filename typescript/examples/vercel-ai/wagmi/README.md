# Vercel AI with wagmi Example

This example demonstrates how to use GOAT with Vercel AI SDK and wagmi for EVM network operations.

It provides a natural language interface for ETH transfers and ERC20 token operations (USDC, WETH) through an interactive CLI.

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
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`: Your WalletConnect project ID.

## Usage

1. Run the Next.js app:
```bash
pnpm dev
```

2. Example interactions:
```
# ETH Operations
Send 0.1 ETH to 0x...
Check ETH balance

# Token Operations
Send 100 USDC to 0x...
Check PEPE balance

# Uniswap Trading
Swap 10 USDC for PEPE
Get best trade route
Execute Uniswap trade
```

3. Understanding responses:
   - Transaction confirmations
   - Balance updates
   - Trade quotes
   - Error messages
   - Operation status
