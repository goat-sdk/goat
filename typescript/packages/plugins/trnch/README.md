<div align="center">
<a href="https://github.com/goat-sdk/goat">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# TRNCH GOAT Plugin

Trade new Robinhood Chain tokens through [TRNCH](https://trnch.fun): a live feed of launches screened by TIA (rugs, honeypots, scam contracts, heavy sell taxes and copycats kept out) and the best route across six routers. Non-custodial: every transaction is sent by your wallet.

## Installation
```bash
npm install @goat-sdk/plugin-trnch
yarn add @goat-sdk/plugin-trnch
pnpm add @goat-sdk/plugin-trnch
```

## Usage
```typescript
import { trnch } from "@goat-sdk/plugin-trnch";

const tools = await getOnChainTools({
    wallet: // a viem wallet on Robinhood Chain (chainId 4663)
    plugins: [
        trnch(), // optional: trnch({ apiKey: process.env.TRNCH_API_KEY, ref: "your-trnch-referral-code" })
    ],
});
```

Without `apiKey`, the plugin creates one on first use by signing a message with the wallet (no funds move). The wallet needs 10 USDG or 0.004 ETH on Robinhood Chain.

Shipping an agent to others? Set `ref` to your TRNCH referral code: every swap made with a key the plugin creates pays you 25% of the TRNCH fee, for life.

## Tools
1. `trnch_get_stats`: live numbers (tokens spotted, kept out, rugs detected, median detection delay)
2. `trnch_get_heat`: the live feed of screened launches
3. `trnch_buy`: buy a token with USDG, best of six routers
4. `trnch_sell`: sell a percent of the balance for USDG

0.5% fee per swap, already deducted from the quotes. Docs: https://trnch.fun/bot
