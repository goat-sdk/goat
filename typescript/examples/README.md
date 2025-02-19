# Examples

## Environment Setup
Each example project requires specific environment variables to run. Copy the `.env.template` file in each project directory to `.env` and fill in the values:

### Common Variables
- `OPENAI_API_KEY`: Required for AI model interaction
  - Get from: https://platform.openai.com/api-keys
  - Format: "sk-" followed by random characters

- `RPC_PROVIDER_URL`: Chain-specific RPC endpoint
  - Format varies by chain (see [Environment Variables Guide](../../docs/environment-variables.mdx))
  - Examples:
    - EVM: `https://eth-mainnet.g.alchemy.com/v2/YOUR-API-KEY`
    - Solana: `https://api.mainnet-beta.solana.com`

- `WALLET_PRIVATE_KEY`: Your wallet's private key
  - Format varies by chain (see [Environment Variables Guide](../../docs/environment-variables.mdx))
  - ⚠️ Never share or commit your private key
  - Examples:
    - EVM: 64-character hex with '0x' prefix
    - Solana: Base58 encoded string

### Project-Specific Variables
Each example project may require additional environment variables specific to the protocols or services it interacts with. See each project's README and `.env.template` for details.

### Security Best Practices
1. Never commit `.env` files to version control
2. Use `.env.template` files to document required variables without values
3. Store sensitive values securely using environment variables or secrets management
4. See the [Environment Variables Guide](../../docs/environment-variables.mdx) for detailed security recommendations

## Vercel AI SDK

### EVM
- [Viem](https://github.com/goat-sdk/goat/tree/main/typescript/examples/vercel-ai/viem)
- [Crossmint Smart Wallets](https://github.com/goat-sdk/goat/tree/main/typescript/examples/vercel-ai/crossmint-smart-wallets)

### Plugins
- [Polymarket](https://github.com/goat-sdk/goat/tree/main/typescript/examples/vercel-ai/polymarket)
- [Coingecko](https://github.com/goat-sdk/goat/tree/main/typescript/examples/vercel-ai/coingecko)

### Solana
- [Solana web3](https://github.com/goat-sdk/goat/tree/main/typescript/examples/vercel-ai/solana)
- [Crossmint Solana Custodial Wallets](https://github.com/goat-sdk/goat/tree/main/typescript/examples/vercel-ai/crossmint-solana-custodial-wallets)


## Langchain
- [Viem](https://github.com/goat-sdk/goat/tree/main/typescript/examples/langchain/viem)

## Eliza
- [Plugin Goat](https://github.com/ai16z/eliza/tree/main/packages/plugin-goat)

## ElevenLabs
- [Conversational Agent](https://github.com/goat-sdk/goat/tree/main/typescript/examples/eleven-labs/conversational-agent)
