<div align="center">
<a href="https://github.com/goat-sdk/goat">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Caelara Shield GOAT Plugin

Screened swap and bridge quotes from [Caelara Shield](https://caelaralabs.com/shield/). The plugin returns quotes and **unsigned** transactions only. It never signs, never holds keys and never sends funds: the wallet you give GOAT signs and submits.

## Installation
```
npm install @goat-sdk/plugin-caelara-shield
yarn add @goat-sdk/plugin-caelara-shield
pnpm add @goat-sdk/plugin-caelara-shield
```

## Setup
```typescript
import { caelaraShield } from "@goat-sdk/plugin-caelara-shield";

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
        caelaraShield(),
    ],
});
```
No API key is needed for these two tools.

## Tools
- `caelara_shield_route_quote`: a swap or bridge quote across Solana, Ethereum, Base, Arbitrum, Optimism, Polygon and BNB Chain, with a heuristic screen of both tokens.
- `caelara_shield_safe_swap`: screens both tokens and builds unsigned transactions. High-risk or unscreened tokens are refused unless `overrideRisk` is true. Only set that after the human user has seen the screening result and agreed.

## Things to know
- A 0.50% integrator fee is included in the quote and is taken on-chain by the router contract or program when the transaction is executed.
- Token screening is heuristic: no findings is not proof of safety. Quotes can change before you send.
- Polygon and BNB Chain tokens are not screened, so builds there need `overrideRisk`. Bridging to or from Solana is not supported.
- Solana swaps depend on the service's own fee account setup and can be refused with a clear error while it is incomplete.
- The service is a hosted API at https://shield.caelaralabs.com. Requests go there; pass a different base URL to `CaelaraShieldApi` to point elsewhere.

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/goat-sdk/goat">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
