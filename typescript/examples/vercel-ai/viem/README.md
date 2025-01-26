# Vercel AI with viem Example

This example demonstrates how to use GOAT with Vercel AI SDK and viem for Base network operations. It provides a natural language interface for ETH transfers, ERC20 token operations (USDC, PEPE), and Uniswap trading through an interactive CLI.

## Overview
The example showcases:
- Base network integration
- ETH transfer capabilities
- ERC20 token operations (USDC, PEPE)
- Uniswap trading integration
- Interactive CLI interface
- Natural language processing
- Real-time transaction monitoring

## Features
- Send ETH transactions
- Manage ERC20 tokens
- Execute Uniswap trades
- Interactive command prompt
- Natural language queries
- Transaction validation
- Error handling and reporting
- GPT-4o-mini model integration

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
- `RPC_PROVIDER_URL`: Base network RPC URL
- `UNISWAP_API_KEY`: Your Uniswap API key
- `UNISWAP_BASE_URL`: Uniswap API base URL

### Prerequisites
1. Base Network Setup
   - Wallet with ETH for gas
   - Access to Base RPC endpoint
   - Understanding of ERC20 tokens

2. Uniswap Setup
   - Valid API key
   - Understanding of trading pairs
   - Access to required endpoints

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

## Note
- Uses GPT-4o-mini model for natural language processing
- Connects to Base network
- Maximum 10 steps per interaction
- Continuous operation until "exit" command
- Real-time transaction logging
