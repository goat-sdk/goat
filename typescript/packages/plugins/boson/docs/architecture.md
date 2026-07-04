# Architecture — @goat-sdk/plugin-boson

## Scope

This package is a thin re-export of the goat-sdk plugin shipped by [`@bosonprotocol/agentic-commerce`](https://www.npmjs.com/package/@bosonprotocol/agentic-commerce). All real logic — MCP transport, tool surface, signing, chain gating — lives in that upstream package; this wrapper exists to publish it under the `@goat-sdk/plugin-boson` name and version line.

```
src/index.ts
    └── re-exports BosonProtocolPlugin / bosonProtocolPlugin / BosonProtocolOptions
        from @bosonprotocol/agentic-commerce
```

## Component map

```
Agent / Framework (Vercel AI, LangChain, ElizaOS, ...)
        │
        ▼
@goat-sdk/adapter-*                ← converts ToolBase[] to framework-native tools
        │
        ▼
BosonProtocolPlugin (PluginBase)   ← from @bosonprotocol/agentic-commerce
        │   chain gating uses supportedChainIds from @bosonprotocol/common
        ▼
BosonProtocolPluginService         ← @Tool-decorated read + write methods
        │
        ├── BosonMCPClient         ← @modelcontextprotocol/sdk client
        │
        └── EVMWalletClient        ← GOAT wallet abstraction (sendTransaction)
```

## Read execution model

Read tools call `BosonMCPClient` directly and return `{success: true, message}` or `{success: false, error}`. No wallet interaction.

## Write execution model

Write tools obtain an unsigned transaction payload from the MCP server, then route it through `walletClient.sendTransaction`. The MCP server never receives private keys.

```
agent calls tool
    → BosonProtocolPluginService method
    → mcpClient.<method>(params)
    → MCP server returns { transactionData: { to, data, value, ... } }
    → walletClient.sendTransaction(...)
    → return { success: true, message: { hash } }
```

EIP-712 typed-data signing is not currently surfaced by `BosonProtocolPluginService`; if needed it must be added upstream in `@bosonprotocol/agentic-commerce`.

## Chain support

`BosonProtocolPlugin.supportsChain()` returns `true` for any EVM chain whose id is in `supportedChainIds` from `@bosonprotocol/common` (configurable via the `CONFIG_IDS` env var; defaults include Ethereum, Polygon, Base, Optimism, Arbitrum and the corresponding testnets).

## Adding a new tool

This wrapper does not own any tools. Open an issue or pull request against [`@bosonprotocol/agentic-commerce`](https://www.npmjs.com/package/@bosonprotocol/agentic-commerce) to add or modify tools, then bump the pinned version in `package.json` to pick up the change.
