# Solana Deside Messaging

Minimal smoke harness for `@goat-sdk/plugin-deside`.

This example does not use an LLM. It loads the GOAT Deside plugin directly, authenticates with a Solana wallet through Deside MCP, and runs a small set of deterministic calls:

- `deside_get_my_identity`
- `deside_list_conversations`
- optional `deside_send_dm`

## Setup

From `typescript/`:

```bash
pnpm install
pnpm turbo build --filter @goat-sdk/plugin-deside
```

Then:

```bash
cd examples/by-use-case/solana-deside-messaging
cp .env.template .env
```

Required values:

- `SOLANA_RPC_URL`
- `SOLANA_PRIVATE_KEY`
- `DESIDE_OAUTH_REDIRECT_URI`

Optional values:

- `DESIDE_TO_WALLET`
- `DESIDE_TEXT`
- `DESIDE_BASE_URL`
- `DESIDE_MCP_PATH`

## Run

```bash
pnpm example
```

If `DESIDE_TO_WALLET` is set, the example also attempts a `deside_send_dm`.

## Hardening Smoke

```bash
pnpm smoke
```

The hardening smoke keeps the same wallet/auth flow but adds:

- `deside_get_user_info`
- `deside_search_agents`
- `deside_mark_dm_read`
- invalid input check
- forced refresh path
- forced auth recovery path
- optional `pending_acceptance` check if `DESIDE_PENDING_TO_WALLET` is provided
