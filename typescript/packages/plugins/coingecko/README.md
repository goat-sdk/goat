<div align="center">
<a href="https://github.com/goat-sdk/goat">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# CoinGecko GOAT Plugin
Get tools to access market data, prices, and onchain analytics through the [CoinGecko API](https://www.coingecko.com/api). Use both the public and pro APIs to fetch detailed information about coins, tokens, pools, and market trends.

## Requirements
- You will need a CoinGecko API key to use this plugin. You can get it from [here](https://www.coingecko.com/api/pricing).

## Installation
```bash
npm install @goat-sdk/plugin-coingecko
yarn add @goat-sdk/plugin-coingecko
pnpm add @goat-sdk/plugin-coingecko
```

## Setup for the Public API

```typescript
import { coingecko } from "@goat-sdk/plugin-coingecko";

const plugin = coingecko({
    apiKey: process.env.COINGECKO_API_KEY,
    isPro: false,
});

// Use IntelliSense-friendly services object
const trendingCoins = await plugin.services.getTrendingCoins({});
console.log("Trending Coins:", trendingCoins);
```

## Setup for the Pro API

```typescript
import { coingecko } from "@goat-sdk/plugin-coingecko";

const plugin = coingecko({
    apiKey: process.env.COINGECKO_API_KEY,
    isPro: true,
});

// Use IntelliSense-friendly services object
const trendingPools = await plugin.services.getTrendingPoolsByNetwork({ network: "eth" });
console.log("Trending Pools by Network:", trendingPools);
```
## Examples

We have included example programs to demonstrate how to use the plugin. These examples are located in the `examples` folder.

### Running the Examples

1. **Build the Plugin**:  
   Before running the examples, make sure to build the plugin:
   ```bash
   pnpm build
   ```

2. **Run the Public API Example**:  
   Navigate to the `examples` folder and run the `call-common-service.ts` file:
   ```bash
   npx ts-node examples/call-common-service.ts
   ```

3. **Run the Pro API Example**:  
   Similarly, run the `call-pro-service.ts` file:
   ```bash
   npx ts-node examples/call-pro-service.ts
   ```

### Example Files

- **`call-common-service.ts`**: Demonstrates how to use the public API to fetch trending coins.
- **`call-pro-service.ts`**: Demonstrates how to use the pro API to fetch trending pools by network.

## Tools

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

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/goat-sdk/goat">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
