# Send NFT to Twitter Address Example

This example demonstrates how to use GOAT with Vercel AI SDK to send NFTs to Twitter users by automatically generating Crossmint wallets. It provides a natural language interface for NFT transfers, handling wallet creation and NFT sending in a single interaction.

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
- `RPC_PROVIDER_URL`: Sepolia RPC URL
- `CROSSMINT_API_KEY`: Your Crossmint API key for wallet operations
  - Use staging key (`CROSSMINT_STAGING_API_KEY`) for development and testing
  - Use production key (`CROSSMINT_API_KEY`) for mainnet operations

## Usage

1. Run the interactive CLI:
```bash
npx ts-node index.ts
```

2. Example interactions:
```
# Send NFT to Twitter User
Send NFT with ID 123 to Twitter user @example
Transfer my NFT to @cryptouser

# Check Status
Verify wallet creation
Check transfer status
```

3. Understanding responses:
   - Wallet creation confirmation
   - Transfer transaction details
   - Error messages
   - Operation status
