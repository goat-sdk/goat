# @goat-sdk/plugin-solentic

Native Solana staking with [Blueprint validator](https://solentic.theblueprint.xyz) via the [GOAT SDK](https://github.com/goat-sdk/goat). Stake, unstake, withdraw, and monitor SOL staking positions through AI agents.

## Installation

```bash
npm install @goat-sdk/plugin-solentic
```

Make sure you also have the required peer dependencies:

```bash
npm install @goat-sdk/core @goat-sdk/wallet-solana
```

## Usage

```typescript
import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { solana } from "@goat-sdk/wallet-solana";
import { solentic } from "@goat-sdk/plugin-solentic";

const tools = await getOnChainTools({
  wallet: solana({ /* wallet config */ }),
  plugins: [solentic()],
});

// Use with your LLM framework of choice (Vercel AI, LangChain, etc.)
```

### Custom API URL

```typescript
solentic({ baseUrl: "https://your-solentic-instance.com" })
```

## Available Tools

### Transaction Tools

| Tool | Description |
|------|-------------|
| `stakeSol` | Stake SOL with Blueprint validator. Builds, signs, and submits in one call. |
| `unstakeSol` | Deactivate a stake account. SOL becomes withdrawable after the epoch ends (~2-3 days). |
| `withdrawStake` | Withdraw SOL from a fully deactivated stake account back to the wallet. |

### Read-Only Tools

| Tool | Description |
|------|-------------|
| `getValidatorInfo` | Full validator details: commission, rank, APY, performance, infrastructure. |
| `getStakingApy` | APY breakdown: base staking APY, Jito MEV APY, total combined APY. |
| `getStakeAccounts` | List all stake accounts for a wallet delegated to Blueprint validator. |
| `checkWithdrawReady` | Check which stake accounts are ready for withdrawal after unstaking. |
| `simulateStake` | Project staking returns for a given amount and duration without transacting. |

## Security

- **Zero custody**: The plugin never handles private keys. All transactions are built as unsigned base64 payloads by the Solentic API and signed by the GOAT wallet client.
- **No key storage**: Private keys remain in the wallet client and are never sent to the Solentic API.
- **Verifiable**: The Solentic API provides a `verify_code_integrity` tool for auditing the server-side transaction building code.

## Staking Lifecycle

1. **Stake**: Call `stakeSol` with an amount. Returns a transaction signature and new stake account address. The stake activates at the next epoch boundary.
2. **Monitor**: Use `getStakeAccounts` to see status. Use `simulateStake` to project returns.
3. **Unstake**: Call `unstakeSol` with the stake account address. Begins the cooldown (deactivation) period.
4. **Withdraw**: After the epoch ends, call `checkWithdrawReady` to verify, then `withdrawStake` to reclaim SOL.

## Links

- [Solentic API](https://solentic.theblueprint.xyz)
- [API Documentation](https://solentic.theblueprint.xyz/docs)
- [GOAT SDK](https://github.com/goat-sdk/goat)

## License

MIT
