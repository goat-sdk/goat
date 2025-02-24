# Goat Coingecko Plugin 🐐 - TypeScript

The CoinGecko plugin for Goat provides comprehensive access to cryptocurrency market data, prices, and on-chain analytics through the CoinGecko API. It offers both free and pro features to fetch detailed information about coins, tokens, pools, and market trends.

## Configuration
Required environment variables:
- `COINGECKO_API_KEY`: Your Coingecko API key
  - Get it from: https://www.coingecko.com/api/pricing
  - Format: 32-character string
  - Required for: Accessing market data and price information
  - See: [Environment Variables Guide](../../../docs/environment-variables.mdx)

## Installation
```bash
npm install @goat-sdk/plugin-coingecko
```

## Setup and Usage with getOnChainTools

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

## Available Tools

### Free Tools
1. **Get Trending Coins** (`coingecko_get_trending_coins`)
   - Fetches the current trending cryptocurrencies

2. **Get Coin Prices** (`coingecko_get_coin_prices`)
   - Fetches prices of specific coins with optional market data
   - Includes options for market cap, 24h volume, and price changes

3. **Search Coins** (`coingecko_search_coins`)
   - Search for coins by keyword

4. **Get Coin Price by Contract Address** (`coingecko_get_coin_price_by_contract_address`)
   - Fetches price data for tokens using their contract addresses

5. **Get Coin Data** (`coingecko_get_coin_data`)
   - Retrieves detailed coin information including market data, community stats, and developer metrics

6. **Get Historical Data** (`coingecko_get_historical_data`)
   - Fetches historical price and market data for a specific coin

7. **Get OHLC Data** (`coingecko_get_ohlc_data`)
   - Gets OHLC (Open, High, Low, Close) chart data

8. **Get Trending Coin Categories** (`coingecko_get_trending_coin_categories`)
   - Fetches trending cryptocurrency categories

9. **Get Coin Categories** (`coingecko_get_coin_categories`)
   - Lists all available coin categories

### Pro Tools
1. **Get Pool Data by Pool Address** (`coingecko_get_pool_data_by_pool_address`)
   - Retrieves detailed data for specific liquidity pools

2. **Get Trending Pools** (`coingecko_get_trending_pools`)
   - Fetches trending liquidity pools across all networks

3. **Get Trending Pools by Network** (`coingecko_get_trending_pools_by_network`)
   - Gets trending pools for a specific blockchain network

4. **Get Top Gainers/Losers** (`coingecko_get_top_gainers_losers`)
   - Lists top performing and worst performing coins

5. **Get Token Data by Token Address** (`coingecko_get_token_data_by_token_address`)
   - Fetches detailed token information using its contract address

6. **Get Tokens Info by Pool Address** (`coingecko_get_tokens_info_by_pool_address`)
   - Retrieves information about all tokens in a specific liquidity pool

## Goat

<div align="center">
Go out and eat some grass.

[Docs](https://ohmygoat.dev) | [Examples](https://github.com/goat-sdk/goat/tree/main/typescript/examples) | [Discord](https://discord.gg/goat-sdk)</div>

## About Goat 🐐
Goat 🐐 (Great Onchain Agent Toolkit) is an open-source library enabling AI agents to interact with blockchain protocols and smart contracts via their own wallets.
