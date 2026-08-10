<div align="center">
<a href="https://github.com/goat-sdk/goat">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# YieldSignal GOAT Plugin

Paid yield and risk intelligence for lending on Base and ETH liquid staking on Ethereum, delivered over the [x402](https://x402.org) protocol — no API key and no account. The agent's wallet pays per call.

Six tools, only the first of which is a commodity:

| Tool | Question it answers |
| --- | --- |
| `yieldsignal_get_yield_signal` | What pays best right now, risk-weighted |
| `yieldsignal_get_yield_decision` | Given where my capital already sits, is moving it worth the cost? |
| `yieldsignal_get_yield_durability` | Is this yield real, or a reward campaign about to end? |
| `yieldsignal_get_exit_capacity` | Can I actually withdraw my size from that market? |
| `yieldsignal_get_rate_sensitivity` | How close is this market to the kink where borrow rates jump? |
| `yieldsignal_get_shared_exposure` | I'm in N venues — but behind how many distinct risks? |

Every response is signed (EIP-712 typed data) by the payment-receiving address, which also holds an [ERC-8004](https://eips.ethereum.org/EIPS/eip-8004) agent identity (`/agent-card.json`) and publishes [EAS](https://base.easscan.org) attestations of past readings on Base mainnet (`/track-record`) — a public, permanent record that doesn't depend on trusting the server's uptime. Per-asset accuracy computed from those attestations is free and unpaid at [`/accuracy.json`](https://yieldsignal.vercel.app/accuracy.json).

## Installation

```bash
npm install @goat-sdk/plugin-yieldsignal
yarn add @goat-sdk/plugin-yieldsignal
pnpm add @goat-sdk/plugin-yieldsignal
```

## Usage

The plugin does not provision a wallet or pick a signer. Pass in an x402 client that already holds funded USDC on Base — anything accepted by [`@x402/fetch`](https://www.npmjs.com/package/@x402/fetch) works. Keeping the client injected is deliberate: it leaves the choice of payment SDK (and its dependency tree) to the consumer instead of pinning one inside this package.

```typescript
import { CdpX402Client } from "@coinbase/cdp-sdk/x402";
import { yieldsignal } from "@goat-sdk/plugin-yieldsignal";

const tools = await getOnChainTools({
    wallet, // any EVM wallet client
    plugins: [
        yieldsignal({
            x402Client: new CdpX402Client(),
        }),
    ],
});
```

## Working examples

```typescript
// "Should I move my 200k USDC out of Aave?"
await tools.yieldsignal_get_yield_decision({
    asset: "USDC",
    position: "aave",
    amountUsd: 200000,
    horizonDays: 30,
});

// "Is the leader's yield actually durable?"
await tools.yieldsignal_get_yield_durability({ asset: "USDC" });

// "I'm in three venues — how much of that is the same risk?"
await tools.yieldsignal_get_shared_exposure({
    asset: "USDC",
    positions: "aave:200000,morpho:150000,compound:80000",
});
```

## Notes

- **Every call is paid.** There is no free tier and no trial parameter; a request without payment returns `402` carrying the exact price, asset and network, which the x402 client settles automatically. Prices are read from that challenge rather than hardcoded here, so this README cannot drift out of date.
- **The four risk reports cover lending only** (`USDC`, `WETH`). This is a measured limit, not an omission: liquid staking has no utilization curve, no borrow side and no itemized incentive component, so those reports would have nothing to compute against.
- **Unmeasurable is reported as unmeasured.** Protocols that don't expose the underlying data are named as such rather than estimated — an exit-capacity reading never reports a protocol as executable when its borrowed amount could not be read, and a durability reading never treats an unitemized APY as incentive-free.
- **Every protocol is compared on one basis** (base interest plus incentives), and each response lists the protocols it could not read, so "best" is never silently "best of whatever answered".

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/goat-sdk/goat">
  <img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>
</footer>
