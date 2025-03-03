<div align="center">
<a href="https://github.com/goat-sdk/goat">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

[Mode](https://mode.network/) governance plugin for Goat. Allows you to interact with Mode's governance system including staking MODE and BPT tokens.

## Installation
```bash
npm install @goat-sdk/plugin-mode-voting
yarn add @goat-sdk/plugin-mode-voting
pnpm add @goat-sdk/plugin-mode-voting
```

## Usage

```typescript
import { modeVoting } from "@goat-sdk/plugin-mode-voting";

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
        modeVoting()
    ]
});
```

## Tools
- Get gauges
- Vote on gauges
- Change votes
- Get voting power

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/goat-sdk/goat">
  <img src="https://github.com/user-attachments/assets/4821833e-52e5-4126-a2a1-59e9fa9bebd7" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
