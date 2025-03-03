<div align="center">
<a href="https://github.com/goat-sdk/goat">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# ZeroDev Global Address Plugin
Create global addresses that can receive tokens from multiple chains with [ZeroDev](https://docs.zerodev.app/global-address).

## Installation
```
npm install @goat-sdk/plugin-zerodev-global-address
yarn add @goat-sdk/plugin-zerodev-global-address
pnpm add @goat-sdk/plugin-zerodev-global-address
```

## Usage

```typescript
import { zeroDevGlobalAddress } from "@goat-sdk/plugin-zerodev-global-address";

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [zeroDevGlobalAddress()],
});
```

## Tools
- Create global addresses that can receive tokens from multiple chains
- Automatic token bridging to your destination chain
- Support for multiple chains:
  - Ethereum Mainnet
  - Polygon
  - Optimism
  - Arbitrum
  - Base
  - Scroll
  - Mode
- Support for different token types:
  - Native tokens
  - ERC20 tokens
  - USDC
  - Wrapped native tokens

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/goat-sdk/goat">
  <img src="https://github.com/user-attachments/assets/4821833e-52e5-4126-a2a1-59e9fa9bebd7" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
