<div align="center">
<a href="https://github.com/goat-sdk/goat">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Opensea GOAT Plugin
Allows you to create tools for getting NFT collection data from [Opensea](https://opensea.io/).

## Installation
```
npm install @goat-sdk/plugin-opensea
yarn add @goat-sdk/plugin-opensea
pnpm add @goat-sdk/plugin-opensea
```

## Usage

```typescript
import { opensea } from "@goat-sdk/plugin-opensea";

const plugin = opensea({
    apiKey: process.env.OPENSEA_API_KEY as string,
});
```

## Tools
- Get NFT collection statistics
- Get recent NFT sales

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/goat-sdk/goat">
  <img src="https://github.com/user-attachments/assets/4821833e-52e5-4126-a2a1-59e9fa9bebd7" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a> 
</div>
</footer>
