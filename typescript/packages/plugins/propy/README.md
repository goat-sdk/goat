<div align="center">
<a href="https://github.com/goat-sdk/goat">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Propy GOAT Plugin

Propy's experimental AI agent to make it easier for new blockchain users to read data from the blockchain.

## Installation
```bash
npm install @goat-sdk/plugin-propy
yarn add @goat-sdk/plugin-propy
pnpm add @goat-sdk/plugin-propy
```

## Usage
```typescript
import { propy } from '@goat-sdk/plugin-propy';

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
      propy({
        chainId: sepolia.id,
        provider: process.env.RPC_PROVIDER_URL,
      })
    ]
});
```

## Tools
* get_staking_power
* get_staking_remaining_lockup_period
* MORE COMING SOON

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/goat-sdk/goat">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
