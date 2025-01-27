# Vercel AI with Solana Name Service (SNS) Example

This example demonstrates how to use GOAT with Vercel AI SDK to interact with Solana Name Service (SNS). It provides a natural language interface for sending SOL to SNS domains (e.g., "example.sol") on the Solana blockchain.

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
- `WALLET_PRIVATE_KEY`: Your Solana wallet's private key (Base58 encoded)
- `RPC_PROVIDER_URL`: Solana RPC URL

## Usage

1. Run the example:
```bash
npx ts-node index.ts
```

2. Example interactions:
```
# SOL Transfers to SNS Domains
Send 0.005 SOL to example.sol
Transfer SOL to myname.sol

# Check Status
Verify transaction status
Check remaining balance
```

3. Understanding responses:
   - Domain resolution confirmation
   - Transaction details
   - Error messages
   - Operation status
