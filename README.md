
<div align="center">

# Goat 🐐

Go out and eat some grass.

[![Build Status](https://github.com/goat-sdk/goat/actions/workflows/ci-pr.yml/badge.svg)](https://github.com/goat-sdk/goat/actions/workflows/ci-pr.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Discord](https://img.shields.io/discord/1234567890?color=7289da&label=Discord&logo=discord&logoColor=white)](https://discord.gg/goat-sdk)

[Documentation](https://ohmygoat.dev) | [Examples](https://github.com/goat-sdk/goat/tree/main/typescript/examples) | [Contributing](CONTRIBUTING.md)

GOAT is free software, MIT licensed, sponsored by [Crossmint](https://www.crossmint.com)
</div>

## Table of Contents
- [Introduction](#introduction)
- [Key Features](#key-features)
- [Getting Started](#getting-started)
- [How it Works](#how-it-works)
- [Development](#development)
- [Technical Details](#technical-details)
- [Contributing](#contributing)
- [Support](#support)

## Introduction
GOAT 🐐 (Great Onchain Agent Toolkit) is an open-source framework for adding blockchain tools such as wallets, being able to hold or trade tokens, or interacting with blockchain smart contracts, to your AI agent.

**Problem**: 

Making agents perform onchain actions is tedious. The ecosystem is heavily fragmented, spanning 5+ popular agent development frameworks, multiple programming languages, and dozens of different blockchains and wallet architectures.
For developers without blockchain expertise, finding clear instructions to perform simple actions - like sending USDC payments or placing Polymarket bets - is nearly impossible.

**Solution**: 

GOAT solves this by providing an open-source, provider-agnostic framework that abstracts away all these combinations.

- **For agent developers**: GOAT offers an always-growing catalog of ready made blockchain actions (sending tokens, using a DeFi protocol, ...) that can be imported as tools into your existing agent. It works with the most popular agent frameworks (Langchain, Vercel's AI SDK, Eliza, etc), Typescript and Python, 30+ blockchains (Solana, Base, Polygon, Mode, ...), and many wallet providers.

- **For dApp / smart contract developers**: develop a plug-in in GOAT, and allow agents built with any of the most popular agent develoment frameworks to access your service.

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- pnpm (v8 or higher)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/goat-sdk/goat.git
   cd goat
   ```

2. Install dependencies:
   ```bash
   cd typescript
   pnpm install
   ```

3. Build the packages:
   ```bash
   pnpm build
   ```

### Troubleshooting
- If you encounter build errors, ensure you have the correct Node.js version
- For dependency issues, try removing `node_modules` and running `pnpm install` again
- Check the [Discord community](https://discord.gg/goat-sdk) for support

## Key Features
1. **Works Everywhere**: Compatible with Langchain, Vercel’s AI SDK, Eliza, and more.
2. **Wallet Agnostic**: Supports all wallets, from your own key pairs to [Crossmint Smart Wallets](https://docs.crossmint.com/wallets/smart-wallets/overview) and Coinbase.
3. **Multi-Chain**: Supports EVM chains and Solana (more coming 👀).
4. **Customizable**: Use or build plugins for any onchain functionality (sending tokens, checking wallet balance, etc) and protocol (Polymarket, Uniswap, etc).

![goat](https://github.com/user-attachments/assets/f6aa46ce-5684-4136-be29-7867acab3f27)

## How it Works
GOAT plugs into your agent's tool calling capabilities, adding all the functions your agent needs to interact with the blockchain. Here's a detailed breakdown of how to integrate GOAT into your project:

### Basic Setup
First, import the necessary dependencies:

#### Configure the wallet you want to use
```typescript
// ... Code to connect your wallet (e.g createWalletClient from viem)
const wallet = ...

const tools = getOnChainTools({
  wallet: viem(wallet),
})
```

#### Add the plugins you need to interact with the protocols you want
```typescript
const wallet = ...

const tools = getOnChainTools({
  wallet: viem(wallet),
  plugins: [
    sendETH(),
    erc20({ tokens: [USDC, PEPE] }),
    faucet(),
    polymarket(),
    // ...
  ],
})
```

#### Connect it to your agent framework of choice
```typescript
// ... Code to connect your wallet (e.g createWalletClient from viem)
const wallet = ...

const tools = getOnChainTools({
  wallet: viem(wallet),
  plugins: [ 
    sendETH(),
    erc20({ tokens: [USDC, PEPE] }), 
    faucet(), 
    polymarket(), 
    // ...
  ],
})

// Vercel's AI SDK
const result = await generateText({
    model: openai("gpt-4o-mini"),
    tools: tools,
    maxSteps: 5,
    prompt: "Send 420 ETH to ohmygoat.eth",
});
```

See our [examples directory](https://github.com/goat-sdk/goat/tree/main/typescript/examples) for more complete examples.

## Development

### Development Workflow
1. Make your changes
2. Run linting: `pnpm lint`
3. Auto-fix linting issues: `pnpm lint -- --fix`
4. Build the packages: `pnpm build`
5. Create a pull request

### CI/CD Process
- All PRs trigger automated checks for:
  - Linting
  - Building
  - Testing
- The main branch uses changesets for automated releases

## Technical Details

### Supported Chains
- EVM-compatible chains (Ethereum, Polygon, Base, Mode)
- Solana
- More chains coming soon

### Supported Wallet Providers
- Viem
- Crossmint Smart Wallets
- Coinbase
- Custom key pairs

### Supported Plugins
- Token transfers (ETH, ERC20)
- NFT interactions
- DeFi protocols (Uniswap, Polymarket)
- Faucets for testing

### Known Limitations
- Some features may require specific wallet providers
- Cross-chain operations require separate wallet configurations

## Contributing
We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:
- Setting up your development environment
- Our coding standards
- The pull request process
- Our community guidelines

## Support
- Join our [Discord community](https://discord.gg/goat-sdk)
- Check our [Documentation](https://ohmygoat.dev)
- Create [GitHub Issues](https://github.com/goat-sdk/goat/issues) for bugs or feature requests
