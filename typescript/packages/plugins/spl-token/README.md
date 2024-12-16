# Goat SPL Token Plugin 🐐 - TypeScript

SPL Token plugin for Goat. Allows you to create tools for transferring and getting the balance of SPL tokens.

## Installation
```
npm install @goat-sdk/plugin-spl-token
```

## Usage

```typescript
import { splToken, USDC, GOAT } from "@goat-sdk/plugin-spl-token";

const plugin = splToken({
    connection,
    network: "mainnet",
    tokens: [USDC, GOAT],
});
```

### Adding custom tokens
```typescript
import { splToken } from "@goat-sdk/plugin-spl-token";


const plugin = splToken({
    tokens: [
        USDC,
        {
            decimals: 9,
            symbol: "POPCAT",
            name: "Popcat",
            mintAddresses: {
                "mainnet": "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr",
            },
        },
    ],
});
```

## Goat

<div align="center">
Go out and eat some grass.

[Docs](https://ohmygoat.dev) | [Examples](https://github.com/goat-sdk/goat/tree/main/typescript/examples) | [Discord](https://discord.gg/goat-sdk)</div>

## Goat 🐐
Goat 🐐 (Great Onchain Agent Toolkit) is an open-source library enabling AI agents to interact with blockchain protocols and smart contracts via their own wallets.
