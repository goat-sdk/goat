# Goat ERC20 Plugin 🐐 - TypeScript

ERC20 plugin for Goat. Allows you to create tools for transferring and getting the balance of ERC20 tokens.

## Installation
```
npm install @goat-sdk/plugin-erc20
```

## Usage

```typescript
import { erc20 } from "@goat-sdk/plugin-erc20";


const plugin = erc20({
    tokens: [USDC, PEPE],
});
```

### Adding custom tokens
```typescript
import { erc20 } from "@goat-sdk/plugin-erc20";


const plugin = erc20({
    tokens: [
        USDC,
        {
            decimals: 18,
            symbol: "SHIB",
            name: "Shiba Inu",
            chains: {
                "1": {
                    contractAddress: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
                },
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
