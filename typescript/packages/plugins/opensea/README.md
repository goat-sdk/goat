# Goat Opensea Plugin 🐐 - TypeScript

Opensea plugin for [Goat 🐐](https://ohmygoat.dev). Allows you to create tools for getting NFT collection data from Opensea.

## Installation
```
npm install @goat-sdk/plugin-opensea
```

## Usage

```typescript
import { opensea } from "@goat-sdk/plugin-opensea";

const plugin = opensea({
    apiKey: process.env.OPENSEA_API_KEY as string,
});
```

## Working example

See the [Vercel AI example](https://github.com/goat-sdk/goat/tree/main/typescript/examples/vercel-ai/opensea) for a working example of how to use the Opensea plugin.

## Goat

<div align="center">
Go out and eat some grass.

[Docs](https://ohmygoat.dev) | [Examples](https://github.com/goat-sdk/goat/tree/main/typescript/examples) | [Discord](https://discord.gg/2F8zTVnnFz)</div>

## Goat 🐐
Goat 🐐 (Great Onchain Agent Toolkit) is an open-source library enabling AI agents to interact with blockchain protocols and smart contracts via their own wallets.
