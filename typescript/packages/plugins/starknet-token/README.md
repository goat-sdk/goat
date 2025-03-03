<div align="center">
<a href="https://github.com/goat-sdk/goat">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Starknet Token GOAT Plugin

Interact with tokens on the [Starknet](https://www.starknet.io/) blockchain.


## Installation

```bash
npm install @goat-sdk/plugin-starknet-token
yarn add @goat-sdk/plugin-starknet-token
pnpm add @goat-sdk/plugin-starknet-token
```

## Usage
```typescript
import { starknetToken, STARKNET_TOKENS } from "@goat-sdk/plugin-starknet-token";

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
        starknetToken({ tokens: STARKNET_TOKENS }),
    ],
});
```

## Tools
- Get token info by symbol
- Transfer token
- Get the balance of token

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/goat-sdk/goat">
  <img src="https://github.com/user-attachments/assets/4821833e-52e5-4126-a2a1-59e9fa9bebd7" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
