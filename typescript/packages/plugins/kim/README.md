<div align="center">
<a href="https://github.com/goat-sdk/goat">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Kim GOAT Plugin

Swap and manage liquidity positions on [Kim](https://kim.exchange/).

## Installation

```bash
npm install @goat-sdk/plugin-kim
yarn add @goat-sdk/plugin-kim
pnpm add @goat-sdk/plugin-kim
```


## Usage

```typescript
import { kim } from "@goat-sdk/plugin-kim";

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
        kim()
    ]
});
```

## Tools
- Swap in a single or multiple hops
- Create liquidity positions and manage them

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/goat-sdk/goat">
  <img src="https://github.com/user-attachments/assets/4821833e-52e5-4126-a2a1-59e9fa9bebd7" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
