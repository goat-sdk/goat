# Goat Coingecko Plugin 🐐 - TypeScript

Get tools to access market data, prices, and onchain analytics through the CoinGecko API. Use both the public and pro APIs to fetch detailed information about coins, tokens, pools, and market trends.

## Requirements
- You will need a CoinGecko API key to use this plugin. You can get it from [here](https://www.coingecko.com/api/pricing).

## Installation
```bash
npm install @goat-sdk/plugin-coingecko
```

## Setup for the Public API

```typescript
import { getOnChainTools } from "@goat-sdk/core";
import { coingecko } from "@goat-sdk/plugin-coingecko";

const tools = await getOnChainTools({
    plugins: [
        coingecko({ 
            apiKey: process.env.COINGECKO_API_KEY 
        })
    ]
});
```

## Setup for the Pro API

```typescript
import { getOnChainTools } from "@goat-sdk/core";
import { coingecko } from "@goat-sdk/plugin-coingecko";

const tools = await getOnChainTools({
    plugins: [
        coingecko({ 
            apiKey: process.env.COINGECKO_API_KEY,
            isPro: true
        })
    ]
});
```

## Available Tools

### Public API Tools
1. Get Trending Coins
2. Get Coin Prices
3. Search Coins
4. Get Coin Price by Contract Address
5. Get Coin Data
6. Get Historical Data
7. Get OHLC Data
8. Get Trending Coin Categories
9. Get Coin Categories

### Pro API Tools
1. Get Pool Data by Pool Address
2. Get Trending Pools
3. Get Trending Pools by Network
4. Get Top Gainers/Losers
5. Get Token Data by Token Address
6. Get Tokens Info by Pool Address

## Goat

<div align="center">
Go out and eat some grass.

[Docs](https://ohmygoat.dev) | [Examples](https://github.com/goat-sdk/goat/tree/main/typescript/examples) | [Discord](https://discord.gg/goat-sdk)</div>

## About Goat 🐐
Goat 🐐 (Great Onchain Agent Toolkit) is an open-source library enabling AI agents to interact with blockchain protocols and smart contracts via their own wallets.
