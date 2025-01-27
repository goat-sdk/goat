# Goat Balmy Plugin 🐐 - TypeScript

Balmy plugin for [Goat 🐐](https://ohmygoat.dev). Allows you to create tools for interacting with the Balmy protocol - a state-of-the-art DCA (Dollar Cost Average) protocol that enables users to DCA any ERC20 into any ERC20 with their preferred period frequency.

## Installation
```bash
npm install @goat-sdk/plugin-balmy
```

## Usage

```typescript
import { balmy } from "@goat-sdk/plugin-balmy";

// Initialize the plugin
const plugin = balmy();

// Get token balances across chains
const balances = await plugin.getBalance({
    account: "0x...",
    tokens: {
        1: [
            "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC on Ethereum
            "0x6b175474e89094c44da98b954eedeac495271d0f"  // DAI on Ethereum
        ],
        10: [
            "0x7f5c764cbc14f9669b88837ca1490cca17c31607", // USDC on Optimism
            "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1"  // DAI on Optimism
        ]
    }
});

// Check token allowances
const allowances = await plugin.getAllowance({
    chainId: 1,
    token: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
    owner: "0x...",
    spenders: ["0x..."]
});

// Get swap quotes
const quotes = await plugin.getQuote({
    chainId: 1,
    sellToken: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
    buyToken: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // WETH
    order: {
        type: "sell",
        sellAmount: "1000000" // 1 USDC (6 decimals)
    },
    slippagePercentage: 1, // 1% slippage
    gasSpeed: {
        speed: "instant"
    }
});

// Execute a swap with the best quote
const tx = await plugin.executeSwap({
    chainId: 1,
    sellToken: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
    buyToken: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // WETH
    order: {
        type: "sell",
        sellAmount: "1000000" // 1 USDC (6 decimals)
    },
    slippagePercentage: 1 // 1% slippage
});
```

## Features

- Get token balances across multiple chains
- Check token allowances for multiple spenders
- Get quotes from DEX aggregators for token swaps
- Execute swaps using the best available quote
- Built-in permit2 support for gasless approvals
- Support for multiple EVM chains

## Working example

See the [Vercel AI example](https://github.com/goat-sdk/goat/tree/main/typescript/examples/vercel-ai/balmy) for a working example of how to use the Balmy plugin.

## Goat

<div align="center">
Go out and eat some grass.

[Docs](https://ohmygoat.dev) | [Examples](https://github.com/goat-sdk/goat/tree/main/typescript/examples) | [Discord](https://discord.gg/2F8zTVnnFz)</div>

## Goat 🐐
Goat 🐐 (Great Onchain Agent Toolkit) is an open-source library enabling AI agents to interact with blockchain protocols and smart contracts via their own wallets. 