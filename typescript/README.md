<div>
  <img src="https://github.com/user-attachments/assets/4821833e-52e5-4126-a2a1-59e9fa9bebd7" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">


<div>
<img src="https://img.shields.io/npm/dm/%40goat-sdk%2Fcore" alt="NPM Downloads">

<img src="https://img.shields.io/github/license/goat-sdk/goat" alt="GitHub License">
</div>
<div>
<img src="https://img.shields.io/badge/v20.12.2-1?label=typescript&color=blue" alt="Typescript Version">

<img src="https://img.shields.io/pypi/pyversions/goat-sdk" alt="PyPI - Python Version">
</div>

GOAT is free software, MIT licensed, sponsored by [Crossmint](https://www.crossmint.com)

</div>

## Table of Contents
- [🐐 Overview](#-overview)
- [🚀 Quickstarts](#-quickstarts)
- [🛠️ Supported tools and frameworks](#️-supported-tools-and-frameworks)
- [💻 Contributing](#-contributing)
- [🤝 Community](#-community)

# 🐐 Overview
GOAT (Great Onchain Agent Toolkit) is the **largest library of onchain tools** for your AI agent:

1. Give your agent a **[wallet](https://github.com/goat-sdk/goat/tree/main#chains-and-wallets)**
2. Allow it to transact on **[any chain](https://github.com/goat-sdk/goat/tree/main#chains-and-wallets)**
3. Use more than **[+200 onchain tools](https://github.com/goat-sdk/goat/tree/main#tools)**
4. Use it with **[any agent framework](https://github.com/goat-sdk/goat/tree/main#agent-frameworks)** of your choice

See everything GOAT supports [here](https://github.com/goat-sdk/goat/tree/main#️-supported-tools-and-frameworks).

**Create agents that can**
- Transfer funds between wallets
- Swap tokens
- Create and manage DeFi positions
- Create, buy and sell NFTs
- Purchase physical assets onchain with crypto
- Get onchain insights

**Lightweight and extendable**

Different from other agent kits, GOAT is designed to be lightweight and extendable by keeping its core minimal and allowing you to **install only the tools you need**.

If you don't find what you need on our more than 200 integrations you can easily:
1. Create your own plugin
2. Integrate a new chain
3. Integrate a new wallet
4. Integrate a new agent framework

See how to do it [here](#-contributing).

# 🚀 Quickstarts

***NOTE**: While a quickstart may be implemented for a specific chain, wallet and agent framework, GOAT's flexibility allows you to easily adapt it to any chain, wallet and agent framework without difficulty.*

- **By use case**
  - Send and receive tokens [[EVM](https://github.com/goat-sdk/goat/tree/main/typescript/examples/by-use-case/evm-send-receive-tokens), [Solana](https://github.com/goat-sdk/goat/tree/main/typescript/examples/by-use-case/solana-send-receive-tokens), [Chromia](https://github.com/goat-sdk/goat/tree/main/typescript/examples/by-use-case/chromia-send-receive-tokens), [Cosmos](https://github.com/goat-sdk/goat/tree/main/typescript/examples/by-use-case/cosmos-send-receive-tokens), [Fuel](https://github.com/goat-sdk/goat/tree/main/typescript/examples/by-use-case/fuel-send-receive-tokens), [Radix](https://github.com/goat-sdk/goat/tree/main/typescript/examples/by-use-case/radix-send-receive-tokens)]
  - Swap tokens [[EVM](https://github.com/goat-sdk/goat/tree/main/typescript/examples/by-use-case/evm-swap-tokens), [Solana](https://github.com/goat-sdk/goat/tree/main/typescript/examples/by-use-case/solana-swap-tokens)]
  - Create and manage DeFi positions [[EVM](https://github.com/goat-sdk/goat/tree/main/typescript/examples/by-use-case/evm-defi-agent), [Solana](https://github.com/goat-sdk/goat/tree/main/typescript/examples/by-use-case/solana-defi-agent)]
  - Mint NFTs [[EVM](https://github.com/goat-sdk/goat/tree/main/typescript/examples/by-use-case/evm-mint-nft), [Solana](https://github.com/goat-sdk/goat/tree/main/typescript/examples/by-use-case/solana-mint-nft)]
  - Make bets on Polymarket [[EVM](https://github.com/goat-sdk/goat/tree/main/typescript/examples/vercel-ai/polymarket)]
  - Launch a token on Pump.fun [[Solana](https://github.com/goat-sdk/goat/tree/main/typescript/examples/by-use-case/solana-launch-token)]
  - Purchase physical assets [coming soon]
- **By framework**
  - [Vercel AI](https://github.com/goat-sdk/goat/tree/main/typescript/examples/by-framework/vercel-ai)
  - [Langchain](https://github.com/goat-sdk/goat/tree/main/typescript/examples/by-framework/langchain)
  - [Eliza Agent](https://github.com/goat-sdk/goat/tree/main/typescript/examples/by-framework/eliza)
  - [GAME Agent](https://github.com/goat-sdk/goat/tree/main/typescript/examples/by-framework/virtuals-game)
  - [MCP (Model Context Protocol)](https://github.com/goat-sdk/goat/tree/main/typescript/examples/by-framework/model-context-protocol)
  - [Voice agent with ElevenLabs](https://github.com/goat-sdk/goat/tree/main/typescript/examples/by-framework/eleven-labs)
- **By wallet**
  - [Crossmint Smart Wallets](https://github.com/goat-sdk/goat/tree/main/typescript/examples/by-wallet/crossmint-smart-wallets)
  - [Crossmint Custodial Wallets](https://github.com/goat-sdk/goat/tree/main/typescript/examples/by-wallet/crossmint-solana-custodial-wallets)
  - [Lit](https://github.com/goat-sdk/goat/tree/main/typescript/examples/by-wallet/lit)
  - [Safe](https://github.com/goat-sdk/goat/tree/main/typescript/examples/by-wallet/safe)

- **See all typescript quickstarts [here](https://github.com/goat-sdk/goat/tree/main/typescript/examples).**
  
# 🛠️ Supported tools and frameworks
- See [here the full list of supported tools and frameworks](https://github.com/goat-sdk/goat/tree/main#️-supported-tools-and-frameworks)

# 💻 Contributing
Do you want a protocol, chain, wallet or agent framework to be supported?

See guides on how to do that here:
- [How to set up the project locally](https://github.com/goat-sdk/goat/tree/main/typescript/docs/2-set-up-the-project-locally.md)
- [How to create a plugin](https://github.com/goat-sdk/goat/tree/main/typescript/docs/3-create-a-plugin.md)
- [How to add a new chain](https://github.com/goat-sdk/goat/tree/main/typescript/docs/4-add-a-new-chain.md)
- [How to add a new wallet provider](https://github.com/goat-sdk/goat/tree/main/typescript/docs/5-add-a-wallet-provider.md)

# 🤝 Community
- Follow us on [X](https://x.com/goat_sdk)
- Join our [Discord](https://discord.gg/goat-sdk)
