# Goat ERC721 Plugin 🐐 - TypeScript

ERC721 plugin for Goat. Allows you to create tools for transferring and getting the balance of ERC721 tokens.

## Installation
```
npm install @goat-sdk/plugin-erc721
```

## Usage

```typescript
import { erc721, BAYC } from "@goat-sdk/plugin-erc721";

const plugin = erc721({
    tokens: [BAYC],
});
```

### Adding custom tokens
```typescript
import { erc721, BAYC } from "@goat-sdk/plugin-erc721";

const plugin = erc721({
  tokens: [
    BAYC,
    {
      symbol: "PUNK",
      name: "CryptoPunks",
      chains: {
        "1": {
          contractAddress: "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB",
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
