<div align="center">
<a href="https://github.com/goat-sdk/goat">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Birdeye GOAT Plugin 🐐

Get token information from [Birdeye](https://birdeye.so/)

## Installation
```bash
npm install @goat-sdk/plugin-birdeye
yarn add @goat-sdk/plugin-birdeye
pnpm add @goat-sdk/plugin-birdeye
```

## Usage

```typescript
import { birdeye } from "@goat-sdk/plugin-birdeye";

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
       birdeye({
            apiKey: process.env.BIRDEYE_API_KEY,
       })
    ]
});
```

## Tools
- Get token price
- Get token history price
- Get OHLCV price of token
- Get OHLCV price of pair
- Get token security
- Get trending tokens
- Search for a token

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/goat-sdk/goat">
  <img src="https://github.com/user-attachments/assets/4821833e-52e5-4126-a2a1-59e9fa9bebd7" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
