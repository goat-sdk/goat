<div align="center">
<a href="https://github.com/goat-sdk/goat">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

[Mode](https://mode.network/) governance plugin for Goat. Allows you to interact with Mode's governance system including staking MODE and BPT tokens.

## Installation
```bash
npm install @goat-sdk/plugin-mode-governance
yarn add @goat-sdk/plugin-mode-governance
pnpm add @goat-sdk/plugin-mode-governance
```

## Usage

```typescript
import { modeGovernance } from "@goat-sdk/plugin-mode-governance";

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
        modeGovernance()
    ]
});
```

## Tools
- Stake MODE or BPT tokens
- Get staking information
- Get balance of MODE, BPT, veMode, or veBPT tokens

## Advanced Usage with GPT-4o and ERC20 Plugin

For improved integration with the GPT-4o model and to work seamlessly with the ERC20 plugin, you can configure your tools as follows:

```typescript
import { MODE, erc20 } from "@goat-sdk/plugin-erc20";
import { modeGovernance } from "@goat-sdk/plugin-mode-governance";

const tools = await getOnChainTools({
    wallet: viem(walletClient),
    plugins: [
        erc20({ tokens: [MODE] }),
        modeGovernance()
    ]
});
```

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/goat-sdk/goat">
  <img src="https://github.com/user-attachments/assets/4821833e-52e5-4126-a2a1-59e9fa9bebd7" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
