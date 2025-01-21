# Vercel AI with DeBridge Example

## Setup

Copy the `.env.template` and populate with your values:
- `OPENAI_API_KEY`: Your OpenAI API key
- `WALLET_PRIVATE_KEY`: Your wallet's private key
- `RPC_PROVIDER_URL`: Ethereum RPC URL

```
cp .env.template .env
```

## Usage

```
npx ts-node index.ts
```

## Examples

Try these prompts:
```
I want to bridge ETH to DBR token on Solana
Find DBR token on Solana and show me its details
What's the current quote for bridging 0.1 ETH to Solana?
```

Note: For cross-chain transfers to Solana, you'll need a Solana wallet address to receive tokens.
