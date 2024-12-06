# Goat Coingecko Plugin 🐐 - TypeScript

Coingecko plugin for Goat. Allows you to create tools for interacting with the CoinGecko API.

## Installation
```
npm install @goat-sdk/plugin-coingecko
```

## Setup
    
```typescript
import { coingecko } from "@goat-sdk/plugin-coingecko";

const plugin = coingecko({ 
    apiKey: process.env.COINGECKO_API_KEY 
});
```

## Available Actions

### Get Trending Coins
Fetches the current trending cryptocurrencies.

### Get Coin Price
Fetches the current price and optional market data for a specific cryptocurrency.

## Goat

<div align="center">
Go out and eat some grass.

[Docs](https://ohmygoat.dev) | [Examples](https://github.com/goat-sdk/goat/tree/main/typescript/examples) | [Discord](https://discord.gg/goat-sdk)</div>

## Goat 🐐
Goat 🐐 (Great Onchain Agent Toolkit) is an open-source library enabling AI agents to interact with blockchain protocols and smart contracts via their own wallets.
