<div align="center">
<a href="https://github.com/goat-sdk/goat">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# YieldSignal GOAT Plugin
Get a real-time, risk-weighted USDC or WETH lending APY signal across Aave, Compound, Morpho, Moonwell, Euler and Fluid on Base — paid per call ($0.01 USDC) via the [x402](https://x402.org) protocol through [YieldSignal](https://yieldsignal.vercel.app).

Every response is signed (EIP-712 typed data) by the payment-receiving address, which also holds an [ERC-8004](https://eips.ethereum.org/EIPS/eip-8004) agent identity (`/agent-card.json`) and periodically publishes [EAS](https://base.easscan.org) attestations of past readings on Base mainnet (`/track-record`) — a public, permanent track record that doesn't depend on trusting the server's uptime.

## Requirements
- A CDP account (`CDP_API_KEY_ID`, `CDP_API_KEY_SECRET`, `CDP_WALLET_SECRET` env vars) funded with a small amount of USDC on Base — the plugin provisions its own wallet via [`@coinbase/cdp-sdk`](https://www.npmjs.com/package/@coinbase/cdp-sdk) and pays $0.01 USDC per call.

## Installation
```bash
npm install @goat-sdk/plugin-yieldsignal
yarn add @goat-sdk/plugin-yieldsignal
pnpm add @goat-sdk/plugin-yieldsignal
```

## Usage

```typescript
import { yieldsignal } from "@goat-sdk/plugin-yieldsignal";

const tools = await getOnChainTools({
    wallet, // any EVM wallet client
    plugins: [
        yieldsignal(),
    ]
});
```

## Tools
1. `get_yield_signal` — returns the current best lending protocol and risk-weighted APY (bps) for USDC or WETH on Base, plus the full per-protocol breakdown used to compute it.

## Why a dedicated wallet instead of the agent's own signer?
x402 payment signing (`@x402/fetch` + `@coinbase/cdp-sdk/x402`) is asset/network-specific and independent from the on-chain actions the agent's own `WalletClientBase` performs — this plugin pays for the API call the same way it's already proven against production (see the [service's own test scripts](https://github.com/Stakemate369/yieldsignal/blob/main/scripts/testPaidCall.mts)), rather than adapting a second signing path into the agent's primary wallet.

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/goat-sdk/goat">
  <img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>
</footer>
