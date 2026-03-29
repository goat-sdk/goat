# @goat-sdk/plugin-atv

GOAT plugin for interacting with [Aarna Trading Vaults (ATV)](https://aarna.finance) — an EVM DeFi vault protocol supporting deposits, withdrawals, staking, and queued withdrawals.

## Installation

```bash
npm install @goat-sdk/plugin-atv
```

## Usage

```typescript
import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { viem } from "@goat-sdk/wallet-viem";
import { atv } from "@goat-sdk/plugin-atv";

const tools = await getOnChainTools({
    wallet: viem(walletClient),
    plugins: [
        atv({
            baseUrl: "https://atv-api.aarna.ai", // optional, this is the default
            apiKey: process.env.ATV_API_KEY,      // optional
        }),
    ],
});
```

## Available tools

### Read tools
| Tool | Description |
|---|---|
| `atv_list_vaults` | List all available vaults (filter by chain or user address) |
| `atv_get_vault` | Get metadata for a vault by contract address |
| `atv_get_vault_apy` | Get APY breakdown (base + reward + total) |
| `atv_get_vault_tvl` | Get current TVL in USD |
| `atv_get_total_tvl` | Get total TVL across all vaults |
| `atv_get_vault_nav` | Get current NAV in USD |
| `atv_get_historical_nav` | Get historical NAV data (7 / 30 / 60 / 360 / max days) |
| `atv_get_historical_tvl` | Get historical TVL data (7 / 30 / 60 / 360 / max days) |
| `atv_get_vault_portfolio` | Get underlying token portfolio breakdown |
| `atv_get_user_investments` | Get a user's position and investment data |
| `atv_get_deposit_status` | Check if deposits are currently paused |
| `atv_get_withdraw_status` | Check if withdrawals are currently paused |
| `atv_get_queue_withdraw_status` | Check if queued withdrawals are currently paused |

### Transaction tools
| Tool | Description |
|---|---|
| `atv_deposit` | Deposit tokens into a vault (approve + deposit) |
| `atv_stake` | Stake vault tokens into a timelock for boosted rewards |
| `atv_unstake` | Unstake vault tokens from a timelock |
| `atv_withdraw` | Withdraw vault shares and receive an output token |
| `atv_queue_withdraw` | Initiate a queued (delayed) withdrawal |
| `atv_unqueue_withdraw` | Cancel a pending queued withdrawal |
| `atv_redeem_withdraw` | Claim a completed queued withdrawal |

## Links

- [ohmygoat.dev](https://ohmygoat.dev)
- [GOAT SDK on GitHub](https://github.com/goat-sdk/goat)
