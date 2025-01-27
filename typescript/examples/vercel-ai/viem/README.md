# Vercel AI with viem Example

This example demonstrates how to use GOAT with Vercel AI SDK and viem for EVM network operations (with Base). It provides a natural language interface for ETH transfers, ERC20 token operations (USDC, PEPE), and Uniswap trading through an interactive CLI.

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
- `WALLET_PRIVATE_KEY`: Your wallet's private key (with 0x prefix)
- `RPC_PROVIDER_URL`: EVM network RPC URL (with Base)
- `UNISWAP_API_KEY`: Your Uniswap API key
- `UNISWAP_BASE_URL`: Uniswap API base URL

## Usage

1. Run the interactive CLI:
```bash
npx ts-node index.ts
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
