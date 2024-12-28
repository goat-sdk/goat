# Vercel AI with ZeroDev Global Address Example

This example demonstrates how to use the ZeroDev Global Address plugin with Vercel AI to create global addresses that can receive tokens from multiple chains and automatically bridge them to a destination chain.

## Features

- Create global addresses that can receive tokens from multiple chains
- Automatic token bridging to your destination chain
- Support for multiple chains:
  - Ethereum Mainnet
  - Polygon
  - Optimism
  - Arbitrum
  - Base
  - Scroll
  - Mode
- Support for different token types:
  - Native tokens
  - ERC20 tokens
  - USDC
  - Wrapped native tokens

## Setup

1. Copy the `.env.template` and populate with your values:

```bash
cp .env.template .env
```

2. Configure the following environment variables:
```
XAI_API_KEY=           # Your XAI API key
WALLET_PRIVATE_KEY=    # Your wallet's private key
RPC_PROVIDER_URL=      # RPC URL for your preferred network
```

## Usage

Run the example:
```bash
npx ts-node index.ts
```

### Example Prompts

You can interact with the AI using natural language prompts like:

**Create a global address for Optimism**
```
get wallet address and create global address for optimism
```

**Create a global address for a specific wallet on Polygon**
```
create global address for this 0x4fd...cd3 on polygon
```

**Create a global address with custom parameters**
```
create global address on arbitrum with 30% slippage
```

## How It Works

The example uses the `@goat-sdk/plugin-zerodev-global-address` plugin to create global addresses that can:
- Receive tokens on any supported chain
- Automatically bridge those tokens to your destination chain
- Handle multiple token types including native tokens, ERC20s, and USDC

note: first on typescript directory run `pnpm install` to install the dependencies and then `pnpm build` to build the packages.