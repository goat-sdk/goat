<div align="center">
<a href="https://github.com/goat-sdk/goat">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Predge GOAT Plugin

Check whether a Polymarket market's resolution is settled, disputed or at risk before your agent trades, pays or settles on it. Records are read live from UMA's Optimistic Oracle on Polygon and signed with ed25519 by [Predge](https://predge.io); the plugin verifies every signature against Predge's published key.

## Installation
```bash
npm install @goat-sdk/plugin-predge
yarn add @goat-sdk/plugin-predge
pnpm add @goat-sdk/plugin-predge
```

## Usage

```typescript
import { predge } from "@goat-sdk/plugin-predge";

const tools = await getOnChainTools({
    wallet: viem(walletClient), // a Base wallet with USDC, only needed for the paid tools
    plugins: [
        predge({
            maxPaymentUsd: 0.05, // per-call cap for paid tools; 0 disables them
        }),
    ],
});
```

No API key is needed.

## Tools

| Tool | Price | What it does |
|---|---|---|
| `predge_get_settlement_risk` | free | Signed settlement-risk record for a market (condition id, numeric id or slug): `risk_level` (`ok`, `watch`, `caution`, `resolved`), UMA state, disputes, signature check |
| `predge_verify_record` | free | Verifies a Predge signed record offline against the pinned key |
| `predge_get_settlement_estimate` | $0.02 USDC | Same record plus `settlement_estimate`: for a disputed market, the calibrated probability that it settles differently from the disputed proposal. Failed requests are not charged |
| `predge_get_whale_trades` | $0.005 USDC | Latest Polymarket trades of $10,000+ notional, delayed 15 minutes |

Paid tools pay over [x402](https://x402.org) with an EIP-3009 USDC authorization signed by the agent's wallet on Base, and never more than `maxPaymentUsd` per call.

## Links

- API docs: https://predge.io/docs
- OpenAPI: https://api.predge.io/openapi.json
- Signing keys: https://api.predge.io/.well-known/predge-keys.json
- Canonicalization spec: https://data.predge.io/canonicalization.md
