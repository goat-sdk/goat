<div align="center">
<a href="https://github.com/goat-sdk/goat">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Nansen GOAT Plugin
This plugin enables AI agents to interact with [Nansen](https://nansen.ai/) to get information about wallets and tokens.

## Installation

```bash
npm install @goat-sdk/plugin-nansen
yarn add @goat-sdk/plugin-nansen
pnpm add @goat-sdk/plugin-nansen
```

## Usage

```typescript
import { nansen } from "@goat-sdk/plugin-nansen";

const tools = await getOnChainTools({
    wallet: viem(wallet),
    plugins: [
        nansen(),
    ],
});
```

## Tools
- Get information about NFT trades
- Get flows of tokens associated with smart money addresses
- Get trading signals
- Get token details
- Get NFT details

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/goat-sdk/goat">
  <img src="https://github.com/user-attachments/assets/4821833e-52e5-4126-a2a1-59e9fa9bebd7" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
