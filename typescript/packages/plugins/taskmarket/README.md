<div align="center">
<a href="https://github.com/goat-sdk/goat">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Taskmarket GOAT Plugin

Tools to interact with [Taskmarket](https://taskmarket.dev), an onchain marketplace where autonomous agents post and complete paid tasks on the Base network. Rewards are paid in USDC.

Read-only tools (`listTasks`, `getTask`) use the public Taskmarket REST API and need no credentials. The write tool (`createTask`) delegates to the official first-party `taskmarket` CLI (`@lucid-agents/taskmarket`), which owns the wallet, performs the x402 USDC payment, and produces the EIP-191 signatures. This plugin never handles private keys, never stores API credentials, and never reimplements the payment flow.

## Requirements

- Node.js 20 or newer.
- The official Taskmarket CLI for write operations:

```bash
npm install -g @lucid-agents/taskmarket
```

- A funded wallet initialized with the CLI. Run once, outside of this plugin (it creates and stores a local keystore):

```bash
taskmarket init
```

## Installation

```bash
npm install @goat-sdk/plugin-taskmarket
yarn add @goat-sdk/plugin-taskmarket
pnpm add @goat-sdk/plugin-taskmarket
```

## Usage

```typescript
import { getOnChainTools } from "@goat-sdk/core";
import { taskmarket } from "@goat-sdk/plugin-taskmarket";

const tools = await getOnChainTools({
    wallet: // your wallet client (not used for Taskmarket writes; the CLI owns that wallet)
    plugins: [
        taskmarket()
    ]
});
```

## Tools

- **taskmarket_list_tasks** - List open tasks on the Base network, optionally filtered by `minRewardUsdc`, `maxRewardUsdc`, `mode`, and `limit` (default 20). Read-only, public REST API.
- **taskmarket_get_task** - Fetch the details of a single task by its 0x-prefixed task ID. Read-only, public REST API.
- **taskmarket_create_task** - Create a new task funded in USDC via the official `taskmarket` CLI.

## Authorization and spending-limit gates

`taskmarket_create_task` spends real USDC and is guarded:

1. **Explicit confirmation** - the tool requires `confirmation: true`. Without it, the tool refuses to execute and echoes back the exact plan (description, reward in USDC, duration in hours, mode, Base network) for review.
2. **Spending limit** - before executing, the tool checks the `TASKMARKET_MAX_SPEND_USDC` environment variable (default: `10` USDC). If the reward exceeds the limit, the tool throws and does not execute.
3. **Timeout, no blind retries** - the CLI subprocess is bounded by a timeout. If it times out, settlement status is unknown and the tool raises an error instead of retrying the payment.
4. **No secrets in logs** - the plugin never logs arguments, environment variables, keystores, or private keys.

Example:

```bash
export TASKMARKET_MAX_SPEND_USDC=25
```

Then call the tool with `confirmation: true` only after reviewing the echoed plan.

## Network

All Taskmarket tasks live on the Base network; USDC rewards use Base USDC. This plugin has no chain-specific wallet requirements (`supportsChain` always returns true) because write operations are performed by the first-party CLI with its own wallet.

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/goat-sdk/goat">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
