<div align="center">
<a href="https://github.com/goat-sdk/goat">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# PlunderSwap GOAT Plugin
Swap tokens on [PlunderSwap](https://plunderswap.xyz/).

## Installation
```
npm install @goat-sdk/plugin-plunderswap
yarn add @goat-sdk/plugin-plunderswap
pnpm add @goat-sdk/plugin-plunderswap
```

## Usage

```typescript
import { plunderswap } from "@goat-sdk/plugin-plunderswap";

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
        plunderswap(),
    ],
});
```

## Tools
- Get quotes
- Swap tokens
- Wrap and unwrap ZIL

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/goat-sdk/goat">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a> 
</div>
</footer>
