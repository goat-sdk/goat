# Goat Uniswap Plugin 🐐 - TypeScript

Uniswap plugin for [Goat 🐐](https://ohmygoat.dev). Allows you to create tools for interacting with Uniswap.

## Configuration
Required environment variables:
- `UNISWAP_API_KEY`: Your Uniswap API key
  - Get it from: https://hub.uniswap.org/
  - Format: 32-character string
  - Required for: Accessing Uniswap's API for quotes and swaps
- `UNISWAP_BASE_URL`: Uniswap API base URL
  - Format: Full URL with protocol and version
  - Default: https://api.uniswap.org/v1
  - See: [Environment Variables Guide](../../../docs/environment-variables.mdx)

## Installation
```
npm install @goat-sdk/plugin-uniswap
```

You can get your Uniswap API key [here](https://hub.uniswap.org/).

For testing purposes, you can use the following base URL and API key:

```
https://trade-api.gateway.uniswap.org/v1
kHEhfIPvCE3PO5PeT0rNb1CA3JJcnQ8r7kJDXN5X
```

## Usage

```typescript
import { uniswap } from "@goat-sdk/plugin-uniswap";


const plugin = uniswap({
    baseUrl: process.env.UNISWAP_BASE_URL as string,
    apiKey: process.env.UNISWAP_API_KEY as string,
});
```

## Working example

See the [Vercel AI example](https://github.com/goat-sdk/goat/tree/main/typescript/examples/vercel-ai/uniswap) for a working example of how to use the Uniswap plugin.

## Goat

<div align="center">
Go out and eat some grass.

[Docs](https://ohmygoat.dev) | [Examples](https://github.com/goat-sdk/goat/tree/main/typescript/examples) | [Discord](https://discord.gg/2F8zTVnnFz)</div>

## Goat 🐐
Goat 🐐 (Great Onchain Agent Toolkit) is an open-source library enabling AI agents to interact with blockchain protocols and smart contracts via their own wallets.
