<div align="center">
<a href="https://github.com/goat-sdk/goat">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# HelmSwap GOAT Plugin

Swap tokens on EVM chains and Solana with [HelmSwap](https://helmswap.com). HelmSwap's public API returns a quote and an unsigned transaction; your GOAT wallet signs and sends it. The plugin never handles private keys, and HelmSwap never signs or broadcasts on your behalf.

A disclosed fee is included in every quote. The quote response shows the fee amount and the minimum output before you swap.

## Installation
```bash
npm install @goat-sdk/plugin-helmswap
yarn add @goat-sdk/plugin-helmswap
pnpm add @goat-sdk/plugin-helmswap
```

## Usage

### EVM
```typescript
import { helmswap } from "@goat-sdk/plugin-helmswap";

const tools = await getOnChainTools({
    wallet: viem(walletClient),
    plugins: [helmswap()],
});
```

Supported chain ids: 1, 56, 999, 4663, 5042, 8453, 57073, 99901.

### Solana
Quotes work without a key. Building Solana swaps needs a free API key from [helmswap.com/developers](https://helmswap.com/developers).

```typescript
import { helmswapSolana } from "@goat-sdk/plugin-helmswap";

const tools = await getOnChainTools({
    wallet: solana({ keypair, connection }),
    plugins: [helmswapSolana({ apiKey: process.env.HELMSWAP_API_KEY })],
});
```

## Tools
* `helmswap_get_quote`: quote a swap on the wallet's EVM chain (expected output, minimum output, price impact, disclosed fee)
* `helmswap_swap`: quote, build and send an EVM swap. When selling an ERC-20, an exact-amount approval is sent first.
* `helmswap_solana_get_quote`: quote a swap on Solana
* `helmswap_solana_swap`: quote, build and send a Solana swap (requires `apiKey`)

All amounts are integer strings in the token's base units. `slippageBps` is optional (default 50, max 1000).

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/goat-sdk/goat">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
