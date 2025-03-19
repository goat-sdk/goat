<div align="center">
<a href="https://github.com/goat-sdk/goat">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Velodrome GOAT Plugin

Swap tokens on [Velodrome](https://velodrome.finance/).

## Installation
```
npm install @goat-sdk/plugin-velodrome
yarn add @goat-sdk/plugin-velodrome
pnpm add @goat-sdk/plugin-velodrome
```

## Usage
```typescript
import { velodrome } from "@goat-sdk/plugin-velodrome";

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [velodrome()],
});
```

## Advanced Usage with ERC20 Plugin

For improved integration to work seamlessly with the ERC20 plugin, you can configure your tools as follows:

```typescript
import { MODE, erc20 } from "@goat-sdk/plugin-erc20";
import { modeGovernance } from "@goat-sdk/plugin-mode-governance";

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
        erc20({ tokens: [MODE] }),
        modeGovernance()
    ]
});
```
## Tools
- Add liquidity
- Swap tokens

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/goat-sdk/goat">
  <img src="https://github.com/user-attachments/assets/4821833e-52e5-4126-a2a1-59e9fa9bebd7" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
