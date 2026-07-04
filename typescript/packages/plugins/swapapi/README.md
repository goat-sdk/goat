<div align="center">
<a href="https://github.com/goat-sdk/goat">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# SwapAPI GOAT Plugin

Free DEX aggregator API plugin. Returns executable swap calldata across 46 EVM chains. No API key required.

## Installation
```bash
npm install @goat-sdk/plugin-swapapi
yarn add @goat-sdk/plugin-swapapi
pnpm add @goat-sdk/plugin-swapapi
```

## Usage
```typescript
import { swapapi } from '@goat-sdk/plugin-swapapi';

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
       swapapi()
    ]
});
```

## Tools
* Get swap quote — fetch executable calldata for a token swap
* Execute swap — fetch a fresh quote and submit the swap transaction

## Links
- [SwapAPI Website](https://swapapi.dev)
- [API Documentation](https://swapapi.dev/llms.txt)
- [GitHub](https://github.com/swap-api/swap-api)

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/goat-sdk/goat">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
