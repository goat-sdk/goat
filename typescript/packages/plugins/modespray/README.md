# Goat Plugin ModeSpray 🐐 💛 - TypeScript

## Installation

```bash
pnpm install @goat-sdk/plugin-modespray
```

## Description

This plugin enables AI agents to interact with ModeSpray on Mode Network, allowing them to **Spray** assets to multiple recipients in a single transaction.

## Usage

```typescript
import { modeSpray } from "@goat-sdk/plugin-modespray";

const tools = await getOnChainTools({
    wallet: viem(wallet),
    plugins: [
        modeSpray(),
        // ... other plugins
    ],
});
```

## Supported Chains

-   Mode Mainnet
-   Mode Testnet

## Links

-   [ModeSpray Tool](https://modespray.xyz/)
