<div align="center">
<a href="https://github.com/goat-sdk/goat">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# DexScreener GOAT Plugin

[DexScreener](https://dexscreener.com/) plugin for Goat. Allows you to create tools for interacting with the DexScreener API.

## Installation
```bash
npm install @goat-sdk/plugin-dexscreener
yarn add @goat-sdk/plugin-dexscreener
pnpm add @goat-sdk/plugin-dexscreener
```

## Usage
```typescript
import { dexscreener } from "@goat-sdk/plugin-dexscreener";

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
        dexscreener()
    ]
});
```

## Tools
1. Get pairs by chain and pairId
2. Search pairs
3. Get token pairs by token address

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/goat-sdk/goat">
  <img src="https://github.com/user-attachments/assets/4821833e-52e5-4126-a2a1-59e9fa9bebd7" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
