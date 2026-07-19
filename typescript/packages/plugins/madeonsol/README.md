<div align="center">
<a href="https://github.com/goat-sdk/goat">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# MadeOnSol GOAT Plugin 🐐

Real-time Solana memecoin intelligence from [MadeOnSol](https://madeonsol.com) — KOL trade feeds from 1,000+ tracked wallets, multi-KOL coordination signals, pump.fun deployer reputation, token buyer-quality scoring, alpha-wallet discovery, and wallet PnL stats.

Get a free API key (200 requests/day, no credit card) at [madeonsol.com/pricing](https://madeonsol.com/pricing).

## Installation
```bash
npm install @goat-sdk/plugin-madeonsol
yarn add @goat-sdk/plugin-madeonsol
pnpm add @goat-sdk/plugin-madeonsol
```

## Usage

```typescript
import { madeonsol } from "@goat-sdk/plugin-madeonsol";

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
       madeonsol({
            apiKey: process.env.MADEONSOL_API_KEY,
       })
    ]
});
```

## Tools
- Get the real-time KOL trade feed (every buy/sell from 1,000+ tracked Solana KOL wallets)
- Detect multi-KOL coordination on a token (convergence signals with a 0-100 score)
- Get the KOL leaderboard (PnL, win rate, volume)
- Get tokens trending by KOL buy volume
- Get pump.fun deployer launch alerts with reputation tiers
- Get a deployer wallet's full reputation profile
- Get one-call token intel (price, market cap, safety flags, KOL activity)
- Score a token's earliest buyers (buyer-quality rug filter)
- Get aggregate trading stats for any Solana wallet (win rate, ROI, verdict)
- Get the alpha-wallets leaderboard (proven early buyers, scored from 1M+ records)

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/goat-sdk/goat">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
