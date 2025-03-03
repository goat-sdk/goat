<div align="center">
<a href="https://github.com/goat-sdk/goat">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Solana MagicEden Plugin

Interact with [MagicEden](https://magiceden.io/) on Solana.

## Installation
```
npm install @goat-sdk/plugin-solana-magiceden
yarn add @goat-sdk/plugin-solana-magiceden
pnpm add @goat-sdk/plugin-solana-magiceden
```

## Setup
```typescript
import { magicEden } from "@goat-sdk/plugin-solana-magiceden";

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
        magicEden({
            apiKey: process.env.MAGICEDEN_API_KEY,
        }),
    ],
});
```

## Tools
- Get NFT information
- Buy NFT

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/goat-sdk/goat">
  <img src="https://github.com/user-attachments/assets/4821833e-52e5-4126-a2a1-59e9fa9bebd7" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
