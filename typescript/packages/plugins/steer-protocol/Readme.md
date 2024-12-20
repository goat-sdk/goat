typescript/packages/plugins/steer-protocol/# Goat Steer Protocol Plugin 🐐 - TypeScript

Steer Protocol plugin for Goat. Allows you to create tools for interacting with Steer Smart Pools, enabling automated liquidity management.

## Installation
```
npm install @goat-sdk/plugin-steer
```

## Setup
    
```typescript
import { steer } from "@goat-sdk/plugin-steer";
import { getOnChainTools } from '@goat-sdk/adapter-vercel-ai';

const tools = getOnChainTools({
    wallet: viem(wallet),
    plugins: [
        steer(),
        // other plugins...
    ],
});
```

## Available Actions

### Deposit into Smart Pool
Deposits token pairs into a Steer Smart Pool for automated liquidity management.

```typescript
// Example parameters
{
    poolAddress: "0x...", // Steer Smart Pool address
    amount0Desired: "1000000000000000000", // 1 token0
    amount1Desired: "1000000000000000000", // 1 token1
    amount0Min: "950000000000000000", // 0.95 token0 (5% slippage)
    amount1Min: "950000000000000000"  // 0.95 token1 (5% slippage)
}
```

### Withdraw from Smart Pool
Withdraws liquidity from a Steer Smart Pool.

```typescript
// Example parameters
{
    poolAddress: "0x...", // Steer Smart Pool address
    shares: "1000000000000000000", // 1 LP token
    amount0Min: "950000000000000000", // 0.95 token0 (5% slippage)
    amount1Min: "950000000000000000"  // 0.95 token1 (5% slippage)
}
```

## Supported Networks
- Ethereum Mainnet
- Arbitrum

## Goat

<div align="center">
Go out and eat some grass.

[Docs](https://ohmygoat.dev) | [Examples](https://github.com/goat-sdk/goat/tree/main/typescript/examples) | [Discord](https://discord.gg/goat-sdk)</div>

## Goat 🐐
Goat 🐐 (Great Onchain Agent Toolkit) is an open-source library enabling AI agents to interact with blockchain protocols and smart contracts via their own wallets.