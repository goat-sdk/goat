<div align="center">
<a href="https://github.com/goat-sdk/goat">
<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Buy on Boson Protocol

This example demonstrates an AI agent that can query and purchase physical goods on [Boson Protocol](https://www.bosonprotocol.io/) — a trust-minimized commerce protocol.

The agent can browse offers, commit to purchases, and handle the full exchange lifecycle (redeem, complete, dispute) using its own EVM wallet.

## Setup

```bash
cp .env.example .env
# Fill in your keys
```

```
WALLET_PRIVATE_KEY=0x...   # Funded Polygon Amoy testnet wallet
ANTHROPIC_API_KEY=sk-ant-...
```

## Get a testnet wallet

```bash
node -e "
const {privateKeyToAccount, generatePrivateKey} = require('viem/accounts');
const pk = generatePrivateKey();
console.log('PK:', pk);
console.log('Address:', privateKeyToAccount(pk).address);
"
```

Fund it at [faucet.polygon.technology](https://faucet.polygon.technology) (select Amoy network).

## Run

```bash
pnpm install
pnpm ts-node index.ts
```

## Example prompts

- "List the configIds, then commit to offer 358 on staging-80002-0 — it's the GOAT SDK permanent demo offer (1 wei, native MATIC, ~1B commits available). Don't redeem."
- "Show me available offers on the testnet"
- "What products can I buy with USDC?"
- "Check the status of my exchanges"

### Permanent demo offer

A permanent offer is live on the staging endpoint specifically so this example
can run end-to-end without listing your own goods first:

| Field | Value |
|-------|-------|
| Endpoint | `https://mcp-staging.bosonprotocol.io/mcp` |
| `configId` | `staging-80002-0` (Polygon Amoy) |
| `offerId` | `358` |
| Price | `1` wei (native MATIC) |
| `exchangeToken` | `0x0000000000000000000000000000000000000000` |
| Seller | id `42` (`0x2a91A0148EE62fA638bE38C7eE05c29a3e568dD8`) |
| Quantity remaining | ~`999,999,998` (effectively unlimited) |
| Valid until | year 287396 (max practical) |

Commit-to-offer transaction proving it works:
[`0xcd81dc5c2c2e7d05ed8a4c84e0263f79fc16fc437cc2a65ce5e3028eecf46980`](https://amoy.polygonscan.com/tx/0xcd81dc5c2c2e7d05ed8a4c84e0263f79fc16fc437cc2a65ce5e3028eecf46980).

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/goat-sdk/goat">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
