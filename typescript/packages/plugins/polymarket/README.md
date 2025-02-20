# Goat Polymarket Plugin 🐐 - TypeScript

Polymarket plugin for [Goat 🐐](https://ohmygoat.dev). Allows you to create tools for interacting with Polymarket.

## Configuration
Required environment variables:
- `POLYMARKET_API_KEY`: Your Polymarket API key
  - Get it from: Using the `polymarket:api-key` script (see setup instructions)
  - Format: UUID string
  - Required for: Accessing Polymarket's API for trading and market data
- `POLYMARKET_SECRET`: Your Polymarket API secret
  - Generated alongside API key
  - Format: Base64 encoded string
- `POLYMARKET_PASSPHRASE`: Your Polymarket API passphrase
  - Generated alongside API key
  - Format: String
  - See: [Environment Variables Guide](../../../docs/environment-variables.mdx)

## Installation
```
npm install @goat-sdk/plugin-polymarket
```

## Usage

```typescript
import { polymarket } from "@goat-sdk/plugin-polymarket";


const plugin = polymarket({
    credentials: {
        key: process.env.POLYMARKET_API_KEY as string,
        secret: process.env.POLYMARKET_SECRET as string,
        passphrase: process.env.POLYMARKET_PASSPHRASE as string,
    },
});
```

## Working example

See the [Vercel AI example](https://github.com/goat-sdk/goat/tree/main/typescript/examples/vercel-ai/polymarket) for a working example of how to use the Polymarket plugin.

## Goat

<div align="center">
Go out and eat some grass.

[Docs](https://ohmygoat.dev) | [Examples](https://github.com/goat-sdk/goat/tree/main/typescript/examples) | [Discord](https://discord.gg/goat-sdk)</div>

## Goat 🐐
Goat 🐐 (Great Onchain Agent Toolkit) is an open-source library enabling AI agents to interact with blockchain protocols and smart contracts via their own wallets.
