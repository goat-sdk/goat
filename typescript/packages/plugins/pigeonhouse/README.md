# @goat-sdk/plugin-pigeonhouse

GOAT plugin for [PigeonHouse](https://941pigeon.fun) — a deflationary token launchpad on Solana where every trade burns PIGEON.

## Installation

```bash
npm install @goat-sdk/plugin-pigeonhouse
```

## Usage

```typescript
import { pigeonhouse } from "@goat-sdk/plugin-pigeonhouse";

const tools = getOnChainTools({
  wallet: solanaWallet,
  plugins: [pigeonhouse()],
});
```

## Tools

| Tool | Description |
|------|-------------|
| `getTokens` | List all active tokens with prices and market caps |
| `getTokenInfo` | Get detailed bonding curve state for a token |
| `getTrades` | Recent trades for a token |
| `getBurnStats` | Platform stats: total PIGEON burned, tokens launched |
| `calculatePrice` | Calculate expected buy/sell output on bonding curve |

## Protocol

- Program: `BV1RxkAaD5DjXMsnofkVikFUUYdrDg1v8YgsQ3iyDNoL`
- Verified: [OtterSec](https://verify.osec.io/status/BV1RxkAaD5DjXMsnofkVikFUUYdrDg1v8YgsQ3iyDNoL)
- Source: [GitHub](https://github.com/noegppgeon-boop/Pigeonhouse)

## License

MIT
