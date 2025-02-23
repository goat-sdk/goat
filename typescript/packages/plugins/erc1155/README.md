# ERC1155 Plugin for GOAT SDK

This plugin provides support for interacting with ERC1155 tokens.

## Installation

```bash
npm install @goat-sdk/plugin-erc1155
```

## Usage

```typescript
import { erc1155 } from "@goat-sdk/plugin-erc1155";
```

### Adding custom tokens

```typescript
import { erc1155 } from "@goat-sdk/plugin-erc1155";


const plugin = erc1155({
    tokens: [
        {
            decimals: 18,
            symbol: "MYGOAT",
            name: "MYGOAT",
            id: 1,
            chains: {
                "919": {
                    contractAddress: "0x6f4a5412DB14EC9b109B3db4A9ddD29CE3Ec0754",
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
