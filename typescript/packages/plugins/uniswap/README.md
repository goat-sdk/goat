# Goat Uniswap Plugin 🐐 - TypeScript

Uniswap plugin for [Goat 🐐](https://ohmygoat.dev). Allows you to create tools for interacting with Uniswap.

## Installation
```
npm install @goat-sdk/plugin-uniswap
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
