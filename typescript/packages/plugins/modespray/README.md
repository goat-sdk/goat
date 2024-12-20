# Goat Plugin ModeSrpray 🐐 💛 - TypeScript

## Installation

```bash
pnpm install @goat-sdk/plugin-modespray
```

## Description

This plugin enables AI agents to interact with ModeSpray on Mode Network, allowing them to **Spray** assets in a single click

## Usage

```typescript
import { modeSprayPlugin } from "@goat-sdk/plugin-modespray";

const tools = await getOnChainTools({
    wallet: viem(wallet),
    plugins: [
        modeSprayPlugin(),
        // ... other plugins
    ],
});
```

## Supported Chains

-   Mode Mainnet
-   Mode Testnet

## Links

-   [ModeSpray Tool](https://modespray.xyz/)
