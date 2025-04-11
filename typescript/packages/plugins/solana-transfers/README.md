<div align="center">
<a href="https://github.com/goat-sdk/goat">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# SolanaTransfers GOAT Plugin

This plugin, developed by [Chasm](https://www.chasm.net), enables seamless token transfers for non-standard Solana wallet implementations including Crossmint Custodial and Smart Wallets.

## Installation

```bash
npm install @goat-sdk/plugin-solana-transfers
yarn add @goat-sdk/plugin-solana-transfers
pnpm add @goat-sdk/plugin-solana-transfers
```

## Usage

```typescript
import { solanaTransfers } from "@goat-sdk/plugin-solana-transfers";

const apiKey = process.env.CROSSMINT_API_KEY;

const { custodial } = crossmint(apiKey);

const wallet = await custodial({
    chain: "solana",
    address: "...",
    connection: new Connection("...", "confirmed"),
});

const tools = await getOnChainTools({
    wallet,
    plugins: [solanaTransfers()],
});
```

## Tools

- Native SOL Transfer
- SPL Token Balance and Info Checking
- SPL Token Transfer

## Author

[@luiyongsheng](https://luiyongsheng.com)

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/goat-sdk/goat">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
