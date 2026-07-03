# Bhairab GOAT Plugin 🐐

Pre-trade token risk scanner for [GOAT](https://github.com/goat-sdk/goat). Lets an
agent check whether a Solana token is safe to buy **before** it executes — catching
honeypots and rugs that drain autonomous trading agents.

## Installation

```bash
npm install @goat-sdk/plugin-bhairab
```

## Usage

```typescript
import { bhairab } from "@goat-sdk/plugin-bhairab";

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
        bhairab(), // free, no API key — heuristic verdict
        // bhairab({ apiKey: process.env.BHAIRAB_API_KEY }), // AI-reasoned verdict
    ],
});
```

The agent gains a `bhairab_scan_token_risk` tool. Given a Solana token mint, it
returns a verdict — `proceed`, `caution`, or `stop` — with cited reasons drawn from
live market signals (liquidity, 24h move, volume, token age) and on-chain authority
checks (freeze-authority honeypots, mint-authority rug risk).

Use it as a guardrail before any buy/swap:

```typescript
// pseudo-flow inside your agent
const { verdict } = await scanTokenRisk({ token: mint });
if (verdict === "stop") return; // don't buy the trap
```

## Configuration

- **No API key** → free heuristic verdict (no signup).
- **`apiKey`** → AI-reasoned verdict. Get one at https://tao-gateway.vercel.app

## Tools

- `bhairab_scan_token_risk` — scan a Solana token mint for risk before trading.

## Demo

Try it on any token: https://tao-gateway.vercel.app/scan
