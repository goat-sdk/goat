# Vercel AI with viem Example

This example demonstrates how to use the Goat Celo Plugin to interact with the Celo blockchain. You'll learn how to set up your environment, configure the plugin, and perform basic operations like deploying contracts and transferring tokens.

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

```
   # OpenAI API key for AI model interaction
   # Get from: https://platform.openai.com/api-keys
   # Format: "sk-" followed by random characters
   OPENAI_API_KEY=your_openai_api_key

   # Your EVM wallet's private key
   # Format: 64-character hex string with '0x' prefix
   # ⚠️ Never share or commit your private key
   WALLET_PRIVATE_KEY=your_wallet_private_key

   # CELO RPC endpoint URL
   RPC_PROVIDER_URL=https://forno.celo.org
```

For detailed information about environment variable formats and how to obtain API keys, see the [Environment Variables Guide](../../../docs/environment-variables.mdx).

## Usage

1. Run the interactive CLI:

```bash
npx ts-node index.ts
```

2. Example interactions:

```
# Deploy a new NFT Collection with name Celo Agent Token with max supply of 10k
> NFT Collection deployed with tx Hash - 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef

# Check the my NFT balance at contract address 0xd5ea4626b64e7758411bae2a52de210e35ced069
> My NFT balance at contract address 0xd5ea4626b64e7758411bae2a52de210e35ced069 is 1

# Mint a new NFT to my wallet address with contract address 0xd5ea4626b64e7758411bae2a52de210e35ced069
> Mint a new NFT to my wallet address
> NFT minted with tx Hash - 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef

# Get me all token IDs for my wallet address at NFT contract 0xd5ea4626b64e7758411bae2a52de210e35ced069
> My token IDs are 1, 2, 3

# Deply a new ERC20 token with name CeloAgent and supply of 1 billion
> ERC20 token deployed with tx Hash - 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef

# Check my ERC20 token balance for wallet address 0x0000000000000000000000000000000000000000 and contract address 0xd5ea4626b64e7758411bae2a52de210e35ced069
> ERC20 token balance of your address is 10341000000

# What is my cUSD balance
> Your cUSD balance is 1000

# Transfer 100 cUSD to 0x0000000000000000000000000000000000000000
> Transferred 100 cUSD to 0x0000000000000000000000000000000000000000 with tx Hash - 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef

# Transfer 1 NFT to 0x0000000000000000000000000000000000000000 from my address at contract address 0xd5ea4626b64e7758411bae2a52de210e35ced069
> Transferred 1 NFT to 0x0000000000000000000000000000000000000000 with tx Hash - 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

## Features

- Deploy ERC20 and ERC721 Contracts: Deploy standard ERC20 and ERC721 contracts on the Celo blockchain.
- Transfer Tokens: Transfer ERC20 and ERC721 tokens to other addresses.
- Check Balances: Retrieve the balance of ERC20 and ERC721 tokens for a given address.
- Mint NFTs: Mint NFTs using the ERC721 standard.
- Token Allowance: Check and manage token allowances.
