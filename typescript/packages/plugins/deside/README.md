# Deside GOAT Plugin

GOAT plugin for wallet-native DM messaging through Deside MCP.

## Status

This package is the GOAT-side integration for the Deside MCP contract.

Current v1 scope:

- OAuth 2.0 + PKCE against Deside MCP
- MCP session bootstrap
- messaging and directory tools exposed through GOAT
- Solana wallet authentication through the GOAT wallet client

Current v1 non-goals:

- background push listener/runtime
- long-running notification orchestration

## Tools

- `deside_send_dm`
- `deside_read_dms`
- `deside_mark_dm_read`
- `deside_list_conversations`
- `deside_get_user_info`
- `deside_get_my_identity`
- `deside_search_agents`

## Usage

```ts
import { getOnChainTools } from "@goat-sdk/core";
import { deside } from "@goat-sdk/plugin-deside";

const tools = await getOnChainTools({
    wallet,
    plugins: [
        deside({
            oauthRedirectUri: "https://your-app.example.com/deside/callback",
        }),
    ],
});
```

The redirect URI must comply with the Deside OAuth policy for the target environment.
