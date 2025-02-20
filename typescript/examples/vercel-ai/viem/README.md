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
  - Get from: https://platform.openai.com/api-keys
  - Format: "sk-" followed by random characters
- `WALLET_PRIVATE_KEY`: Your wallet's private key
  - Format: 64-character hex string with '0x' prefix
  - ⚠️ Never share or commit your private key
- `RPC_PROVIDER_URL`: EVM network RPC URL
  - Format: Full URL with API key (if required)
  - Example: https://mainnet.base.org
  - See: [Environment Variables Guide](../../../docs/environment-variables.mdx)
- `UNISWAP_API_KEY`: Your Uniswap API key
  - Get from: https://hub.uniswap.org
  - Format: 32-character string
- `UNISWAP_BASE_URL`: Uniswap API base URL
  - Format: Full URL with protocol and version
  - Default: https://api.uniswap.org/v1

For detailed information about environment variable formats and how to obtain API keys, see the [Environment Variables Guide](../../../docs/environment-variables.mdx).

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
