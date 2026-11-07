<div align="center">
<a href="https://github.com/goat-sdk/goat">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Recta GOAT Plugin

[Recta](https://api.recta.build/llms.txt) gives an agent a free second opinion on a cross-chain stablecoin transfer
before it sends it: can a cheaper route than the one the agent would use be proven, at the same chain state?

The plugin only reads. It never signs and never sends a transaction, and it needs no API key.

## Installation
```bash
npm install @goat-sdk/plugin-recta
yarn add @goat-sdk/plugin-recta
pnpm add @goat-sdk/plugin-recta
```

## Usage
```typescript
import { recta } from "@goat-sdk/plugin-recta";

const tools = await getOnChainTools({
    wallet: // an EVM wallet client
    plugins: [
        recta(), // or recta({ estimateFeesPerGas: (chainId) => myClient.estimateFeesPerGas() })
    ]
});
```

## Tools
1. `recta_check_route_coverage`: whether Recta covers a corridor from the wallet's chain, and which routes it compares
2. `recta_get_route_saving_odds`: how often Recta has found a saving against each route on that corridor
3. `recta_compare_bridge_route`: for a planned transfer and the route you would use, whether a cheaper route can be
   proven, its saving (lower bound, USDC) and Recta's fee (3 calls a day per address)

## Pricing
These tools are free. Recta charges exactly 5% of a saving it verifies on chain, and only after the agent executes
Recta's route; with no saving, the agent keeps its own route and owes nothing. To get and execute a route, sign a
request with [`@recta/client`](https://www.npmjs.com/package/@recta/client) or the
[`@recta/mcp`](https://www.npmjs.com/package/@recta/mcp) server.

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/goat-sdk/goat">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
