# Goat Pump.fun Plugin 🐐 - TypeScript

Pump.fun plugin for Goat. Allows you to create tools for interacting with the Pump.fun API.

## Installation
```
npm install @goat-sdk/plugin-pumpfun
```

## Setup

```typescript
import { pumpfun } from "@goat-sdk/plugin-pumpfun";

const plugin = pumpfun();
```

## Available Actions

### Create and Buy Token
Creates a token and buys it using pump.fun.

Parameters:
- `name`: The name of the token.
- `symbol`: The symbol of the token.
- `description`: The description of the token.
- `imageUrl`: The image URL of the token.
- `amountToBuyInSol`: The amount of tokens to buy in SOL base units.
- `slippage`: The slippage percentage.
- `priorityFee`: The priority fee in lamports.

## Goat

<div align="center">
Go out and eat some grass.

[Docs](https://ohmygoat.dev) | [Examples](https://github.com/goat-sdk/goat/tree/main/typescript/examples) | [Discord](https://discord.gg/goat-sdk)</div>

## Goat 🐐
Goat 🐐 (Great Onchain Agent Toolkit) is an open-source library enabling AI agents to interact with blockchain protocols and smart contracts via their own wallets.
