

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

<br>
<div align="center">
<div style="margin-bottom: 5px;">
<b>Sponsored by</b>
</div>
<div>
<a href="https://www.crossmint.com" target="_blank"> <img src="https://github.com/user-attachments/assets/f3bdfbe3-2a87-48ec-aacb-a5e72737018c" alt="Crossmint logo" width="180px" height="auto" style="object-fit: contain;"></a>
</div>
</div>

## Table of Contents
- [🐐 Overview](#-overview)
- [🚀 Quickstarts](#-quickstarts)
  - [📘 Typescript](#-typescript)
  - [🐍 Python](#-python)
- [🛠️ Supported tools and frameworks](#️-supported-tools-and-frameworks)
  - [Tools](#tools)
  - [Chains and wallets](#chains-and-wallets)
  - [Agent Frameworks](#agent-frameworks)
- [💻 Contributing](#-contributing)
- [🤝 Community](#-community)

# 🐐 Overview
GOAT (Great Onchain Agent Toolkit) is the **largest library of onchain tools** for your AI agent:

1. Give your agent a **[wallet](https://github.com/goat-sdk/goat/tree/main#chains-and-wallets)**
2. Allow it to transact on **[any chain](https://github.com/goat-sdk/goat/tree/main#chains-and-wallets)**
3. Use more than **[+200 onchain tools](https://github.com/goat-sdk/goat/tree/main#tools)**
4. Use it with **[any agent framework](https://github.com/goat-sdk/goat/tree/main#agent-frameworks)** of your choice

See everything GOAT supports [here](#️-supported-tools-and-frameworks).

**Create agents that can**
- Transfer funds between wallets
- Swap tokens
- Make bets on Polymarket
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



**License**

GOAT is free software, MIT licensed.

# 🚀 Quickstarts

***NOTE**: While a quickstart may be implemented for a specific chain, wallet and agent framework, GOAT's flexibility allows you to easily adapt it to any chain, wallet and agent framework without difficulty.*

## 📘 Typescript

- **By use case**
  - Send and receive tokens [[EVM](https://github.com/goat-sdk/goat/tree/main/typescript/examples/by-use-case/evm-send-and-receive-tokens), [Solana](https://github.com/goat-sdk/goat/tree/main/typescript/examples/by-use-case/solana-send-and-receive-tokens), [Chromia](https://github.com/goat-sdk/goat/tree/main/typescript/examples/by-use-case/chromia-send-and-receive-tokens), [Cosmos](https://github.com/goat-sdk/goat/tree/main/typescript/examples/by-use-case/cosmos-send-and-receive-tokens), [Fuel](https://github.com/goat-sdk/goat/tree/main/typescript/examples/by-use-case/fuel-send-and-receive-tokens), [Radix](https://github.com/goat-sdk/goat/tree/main/typescript/examples/by-use-case/radix-send-and-receive-tokens)]
  - Swap tokens [[EVM](https://github.com/goat-sdk/goat/tree/main/typescript/examples/by-use-case/evm-swap-tokens), [Solana](https://github.com/goat-sdk/goat/tree/main/typescript/examples/by-use-case/solana-swap-tokens)]
  - Create and manage DeFi positions [[EVM](https://github.com/goat-sdk/goat/tree/main/typescript/examples/by-use-case/evm-defi-agent), [Solana](https://github.com/goat-sdk/goat/tree/main/typescript/examples/by-use-case/solana-defi-agent)]
  - Mint NFTs [[EVM](https://github.com/goat-sdk/goat/tree/main/typescript/examples/by-use-case/evm-mint-nft), [Solana](https://github.com/goat-sdk/goat/tree/main/typescript/examples/by-use-case/solana-mint-nft)]
  - Make bets on Polymarket [[EVM](https://github.com/goat-sdk/goat/tree/main/typescript/examples/by-use-case/evm-bet-on-polymarket)]
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

## 🐍 Python
- **By use case**
  - Send and receive tokens [[EVM](https://github.com/goat-sdk/goat/tree/main/python/examples/langchain/web3), [Solana](https://github.com/goat-sdk/goat/tree/main/python/examples/langchain/solana)]
  - Swap tokens [[EVM](https://github.com/goat-sdk/goat/tree/main/python/examples/langchain/uniswap), [Solana](https://github.com/goat-sdk/goat/tree/main/python/examples/langchain/solana)]
- **By framework**
  - Langchain [[EVM](https://github.com/goat-sdk/goat/tree/main/python/examples/langchain/web3), [Solana](https://github.com/goat-sdk/goat/tree/main/python/examples/langchain/solana)]
  - GAME Agent [[EVM](https://github.com/game-by-virtuals/game-python/tree/main/plugins/onchain_actions)]
  - ZerePy [[EVM](https://github.com/goat-sdk/goat/tree/main/python/examples/zerepy/web3)]
- **See all python quickstarts [here](https://github.com/goat-sdk/goat/tree/main/python/examples).**

# 🛠️ Supported tools and frameworks

## Tools

| Plugin | Tools | Typescript | Python |
| --- | --- | --- | --- |
| 0x | Get quotes and swap on 0x | [@goat-sdk/plugin-0x](https://github.com/goat-sdk/goat/tree/main/typescript/packages/plugins/0x) |
| 1inch | Get the balances of a wallet using 1inch API | [@goat-sdk/plugin-1inch](https://github.com/goat-sdk/goat/tree/main/typescript/packages/plugins/1inch) | [goat-sdk-plugin-1inch](https://github.com/goat-sdk/goat/tree/main/python/src/plugins/1inch) |
| Allora | Get price predictions using Allora API | [@goat-sdk/plugin-allora](https://github.com/goat-sdk/goat/tree/main/typescript/packages/plugins/allora) | [goat-sdk-plugin-allora](https://github.com/goat-sdk/goat/tree/main/python/src/plugins/allora) |
| Avnu | Swap tokens on Starknet | [@goat-sdk/plugin-avnu](https://www.npmjs.com/package/@goat-sdk/plugin-avnu) |
| Balancer | Swap tokens and provide liquidity on Balancer | [@goat-sdk/plugin-balancer](https://www.npmjs.com/package/@goat-sdk/plugin-balancer) |
| Balmy | Swap tokens on Balmy | [@goat-sdk/plugin-balmy](https://www.npmjs.com/package/@goat-sdk/plugin-balmy) |
| BetSwirl | Play casino games | [@goat-sdk/plugin-betswirl](https://www.npmjs.com/package/@goat-sdk/plugin-betswirl) |
| BirdEye | Get token insights using BirdEye API | [@goat-sdk/plugin-birdeye](https://www.npmjs.com/package/@goat-sdk/plugin-birdeye) |
| BMX | Get token insights using BMX API | [@goat-sdk/plugin-bmx](https://www.npmjs.com/package/@goat-sdk/plugin-bmx) |
| CoinGecko | Get coin information using CoinGecko API | [@goat-sdk/plugin-coingecko](https://www.npmjs.com/package/@goat-sdk/plugin-coingecko) | [goat-sdk-plugin-coingecko](https://github.com/goat-sdk/goat/tree/main/python/src/plugins/coingecko) |
| Coinmarketcap | Get coin information using Coinmarketcap API | [@goat-sdk/plugin-coinmarketcap](https://www.npmjs.com/package/@goat-sdk/plugin-coinmarketcap) |
| Cosmosbank | Interact with Cosmos tokens | [@goat-sdk/plugin-cosmosbank](https://www.npmjs.com/package/@goat-sdk/plugin-cosmosbank) |
| Crossmint Headless Checkout | Purchase any NFT on any chain using Crossmint | [@goat-sdk/plugin-crossmint-headless-checkout](https://www.npmjs.com/package/@goat-sdk/plugin-crossmint-headless-checkout) |
| Crossmint Mint, Faucet, Wallets | Create a wallet, mint tokens and get test tokens on any chain using Crossmint | [@goat-sdk/plugin-crossmint-mint-faucet-wallets](https://www.npmjs.com/package/@goat-sdk/plugin-crossmint-mint-faucet-wallets) |
| DeBridge | Bridge tokens on DeBridge | [@goat-sdk/plugin-debridge](https://www.npmjs.com/package/@goat-sdk/plugin-debridge) | [goat-sdk-plugin-debridge](https://github.com/goat-sdk/goat/tree/main/python/src/plugins/debridge) |
| Dexscreener | Get token information using Dexscreener API | [@goat-sdk/plugin-dexscreener](https://www.npmjs.com/package/@goat-sdk/plugin-dexscreener) | [goat-sdk-plugin-dexscreener](https://github.com/goat-sdk/goat/tree/main/python/src/plugins/dexscreener) |
| ENS | Resolve ENS names to addresses | [@goat-sdk/plugin-ens](https://www.npmjs.com/package/@goat-sdk/plugin-ens) |
| Enso | Find the most optimal route between tokens | [@goat-sdk/plugin-enso](https://www.npmjs.com/package/@goat-sdk/plugin-enso) |
| ERC20 | Interact with any ERC20 token | [@goat-sdk/plugin-erc20](https://www.npmjs.com/package/@goat-sdk/plugin-erc20) | [goat-sdk-plugin-erc20](https://github.com/goat-sdk/goat/tree/main/python/src/plugins/erc20) |
| ERC721 | Interact with any ERC721 token | [@goat-sdk/plugin-erc721](https://www.npmjs.com/package/@goat-sdk/plugin-erc721) |
| Etherscan | Get transaction information using Etherscan API | [@goat-sdk/plugin-etherscan](https://www.npmjs.com/package/@goat-sdk/plugin-etherscan) |
| Farcaster | Read and post casts on Farcaster | [@goat-sdk/plugin-farcaster](https://www.npmjs.com/package/@goat-sdk/plugin-farcaster) | [goat-sdk-plugin-farcaster](https://github.com/goat-sdk/goat/tree/main/python/src/plugins/farcaster) |
| Ionic | Borrow and lend on Ionic | [@goat-sdk/plugin-ionic](https://www.npmjs.com/package/@goat-sdk/plugin-ionic) |
| Ironclad | Create positions on Ironclad | [@goat-sdk/plugin-ironclad](https://www.npmjs.com/package/@goat-sdk/plugin-ironclad) |
| JSON RPC | Call any JSON RPC endpoint |[@goat-sdk/plugin-json-rpc](https://www.npmjs.com/package/@goat-sdk/plugin-json-rpc) | [goat-sdk-plugin-json-rpc](https://github.com/goat-sdk/goat/tree/main/python/src/plugins/json_rpc) |
| Jupiter | Swap tokens on Jupiter | [@goat-sdk/plugin-jupiter](https://www.npmjs.com/package/@goat-sdk/plugin-jupiter) | [goat-sdk-plugin-jupiter](https://github.com/goat-sdk/goat/tree/main/python/src/plugins/jupiter) |
| KIM | Swap tokens on KIM | [@goat-sdk/plugin-kim](https://www.npmjs.com/package/@goat-sdk/plugin-kim) |
| Lulo | Deposit USDC on Lulo | [@goat-sdk/plugin-lulo](https://www.npmjs.com/package/@goat-sdk/plugin-lulo) |
| Mayan | Cross-chain token swap using Mayan SDK (Solana, EVM, SUI) | [@goat-sdk/plugin-mayan](https://www.npmjs.com/package/@goat-sdk/plugin-mayan) |
| Meteora | Create liquidity pools on Meteora | [@goat-sdk/plugin-meteora](https://www.npmjs.com/package/@goat-sdk/plugin-meteora) |
| Mode Governance | Create a governance proposal on Mode | [@goat-sdk/plugin-mode-governance](https://www.npmjs.com/package/@goat-sdk/plugin-mode-governance) |
| Mode Voting | Vote on a governance proposal on Mode | [@goat-sdk/plugin-mode-voting](https://www.npmjs.com/package/@goat-sdk/plugin-mode-voting) |
| Mode Spray | Spray tokens on Mode | [@goat-sdk/plugin-mode-spray](https://www.npmjs.com/package/@goat-sdk/plugin-mode-spray) |
| Nansen | Get Nansen information using Nansen API | [@goat-sdk/plugin-nansen](https://www.npmjs.com/package/@goat-sdk/plugin-nansen) | [goat-sdk-plugin-nansen](https://github.com/goat-sdk/goat/tree/main/python/src/plugins/nansen) |
| OpenSea | Get nft and sales information using OpenSea API | [@goat-sdk/plugin-opensea](https://www.npmjs.com/package/@goat-sdk/plugin-opensea) | [goat-sdk-plugin-opensea](https://github.com/goat-sdk/goat/tree/main/python/src/plugins/opensea) |
| Orca | Create positions on Orca | [@goat-sdk/plugin-orca](https://www.npmjs.com/package/@goat-sdk/plugin-orca) |
| PlunderSwap | Currency exchange on Zilliqa | [@goat-sdk/plugin-plunderswap](https://www.npmjs.com/package/@goat-sdk/plugin-plunderswap) |
| Polymarket | Bet on Polymarket | [@goat-sdk/plugin-polymarket](https://www.npmjs.com/package/@goat-sdk/plugin-polymarket) |
| Pump.fun | Launch a token on Pump.fun | [@goat-sdk/plugin-pump-fun](https://www.npmjs.com/package/@goat-sdk/plugin-pump-fun) |
| Renzo | Create a position on Renzo | [@goat-sdk/plugin-renzo](https://www.npmjs.com/package/@goat-sdk/plugin-renzo) |
| Rugcheck | Check SPL token validity on Rugcheck | [@goat-sdk/plugin-rugcheck](https://www.npmjs.com/package/@goat-sdk/plugin-rugcheck) | [goat-sdk-plugin-rugcheck](https://github.com/goat-sdk/goat/tree/main/python/src/plugins/rugcheck) |
| SNS | Interact with SNS | [@goat-sdk/plugin-sns](https://www.npmjs.com/package/@goat-sdk/plugin-sns) |
| Solana Magic Eden | Purchase NFTs on Magic Eden | [@goat-sdk/plugin-solana-magiceden](https://www.npmjs.com/package/@goat-sdk/plugin-solana-magiceden) |
| Solana NFTs | Get NFT information using Solana NFTs API | [@goat-sdk/plugin-solana-nfts](https://www.npmjs.com/package/@goat-sdk/plugin-solana-nfts) |
| SPL Tokens | Interact with SPL tokens | [@goat-sdk/plugin-spl-token](https://www.npmjs.com/package/@goat-sdk/plugin-spl-token) | [goat-sdk-plugin-spl-token](https://github.com/goat-sdk/goat/tree/main/python/src/plugins/spl_token) |
| Starknet Token | Interact with Starknet tokens | [@goat-sdk/plugin-starknet-token](https://www.npmjs.com/package/@goat-sdk/plugin-starknet-token) |
| Superfluid | Create streams with Superfluid | [@goat-sdk/plugin-superfluid](https://www.npmjs.com/package/@goat-sdk/plugin-superfluid) | [goat-sdk-plugin-superfluid](https://github.com/goat-sdk/goat/tree/main/python/src/plugins/superfluid) |
| Synth | Get synthetic price data using Synth Subnet API | [@goat-sdk/plugin-synth-api](https://www.npmjs.com/package/@goat-sdk/plugin-synth-api) |
| Tensor | Purchase tokens on Tensor | [@goat-sdk/plugin-tensor](https://www.npmjs.com/package/@goat-sdk/plugin-tensor) |
| Uniswap | Swap tokens on Uniswap | [@goat-sdk/plugin-uniswap](https://www.npmjs.com/package/@goat-sdk/plugin-uniswap) | [goat-sdk-plugin-uniswap](https://github.com/goat-sdk/goat/tree/main/python/src/plugins/uniswap) |
| Velodrome | Create a position on Velodrome | [@goat-sdk/plugin-velodrome](https://www.npmjs.com/package/@goat-sdk/plugin-velodrome) |
| Worldstore | Purchase physical assets on Worldstore | [@goat-sdk/plugin-worldstore](https://www.npmjs.com/package/@goat-sdk/plugin-worldstore) |
| ZeroDev Global Address | Create a global address on ZeroDev | [@goat-sdk/plugin-zero-dev-global-address](https://www.npmjs.com/package/@goat-sdk/plugin-zero-dev-global-address) |
| Zilliqa | Interact with Zilliqa | [@goat-sdk/plugin-zilliqa](https://www.npmjs.com/package/@goat-sdk/plugin-zilliqa) |


## Chains and wallets
| Wallet | Typescript | Python |
| --- | --- | --- |
| EVM (any EVM compatible chain) | [@goat-sdk/wallet-evm](https://github.com/goat-sdk/goat/tree/main/typescript/packages/wallets/evm) | [goat-sdk-wallet-evm](https://github.com/goat-sdk/goat/tree/main/python/src/wallets/evm) |
| Viem / Web3 (any EVM compatible chain) | [@goat-sdk/wallet-viem](https://github.com/goat-sdk/goat/tree/main/typescript/packages/wallets/viem) | [goat-sdk-wallet-web3](https://github.com/goat-sdk/goat/tree/main/python/src/wallets/web3) |
| Solana | [@goat-sdk/wallet-solana](https://github.com/goat-sdk/goat/tree/main/typescript/packages/wallets/solana) | [goat-sdk-wallet-solana](https://github.com/goat-sdk/goat/tree/main/python/src/wallets/solana) |
| Crossmint | [@goat-sdk/wallet-crossmint](https://github.com/goat-sdk/goat/tree/main/typescript/packages/wallets/crossmint) | [goat-sdk-wallet-crossmint](https://github.com/goat-sdk/goat/tree/main/python/src/wallets/crossmint) |
| Aptos | [@goat-sdk/wallet-aptos](https://github.com/goat-sdk/goat/tree/main/typescript/packages/wallets/aptos) |
| Chromia | [@goat-sdk/wallet-chromia](https://github.com/goat-sdk/goat/tree/main/typescript/packages/wallets/chromia) |
| Cosmos | [@goat-sdk/wallet-cosmos](https://github.com/goat-sdk/goat/tree/main/typescript/packages/wallets/cosmos) |
| Fuel | [@goat-sdk/wallet-fuel](https://github.com/goat-sdk/goat/tree/main/typescript/packages/wallets/fuel) |
| Lit | [@goat-sdk/wallet-lit](https://github.com/goat-sdk/goat/tree/main/typescript/packages/wallets/lit) |
| Radix | [@goat-sdk/wallet-radix](https://github.com/goat-sdk/goat/tree/main/typescript/packages/wallets/radix) |
| Safe | [@goat-sdk/wallet-safe](https://github.com/goat-sdk/goat/tree/main/typescript/packages/wallets/safe) |
| Sui | [@goat-sdk/wallet-sui](https://github.com/goat-sdk/goat/tree/main/typescript/packages/wallets/sui) |
| Starknet | [@goat-sdk/wallet-starknet](https://github.com/goat-sdk/goat/tree/main/typescript/packages/wallets/starknet) |
| Zetrix | [@goat-sdk/wallet-zetrix](https://github.com/goat-sdk/goat/tree/main/typescript/packages/wallets/zetrix) |
| Zilliqa | [@goat-sdk/wallet-zilliqa](https://github.com/goat-sdk/goat/tree/main/typescript/packages/wallets/zilliqa) |

## Agent Frameworks
| Adapter | Typescript | Python |
| --- | --- | --- |
| AI SDK | [@goat-sdk/adapter-vercel-ai](https://github.com/goat-sdk/goat/tree/main/typescript/packages/adapters/vercel-ai) |
| Langchain | [@goat-sdk/adapter-langchain](https://github.com/goat-sdk/goat/tree/main/typescript/packages/adapters/langchain) | [goat-sdk-adapter-langchain](https://github.com/goat-sdk/goat/tree/main/python/src/adapters/langchain)
| ElevenLabs | [@goat-sdk/adapter-eleven-labs](https://github.com/goat-sdk/goat/tree/main/typescript/packages/adapters/eleven-labs)
| LlamaIndex | [@goat-sdk/adapter-llamaindex](https://github.com/goat-sdk/goat/tree/main/typescript/packages/adapters/llamaindex) |
| Model Context Protocol | [@goat-sdk/adapter-model-context-protocol](https://github.com/goat-sdk/goat/tree/main/typescript/packages/adapters/model-context-protocol) |
| Eliza | [@elizaos/plugin-goat](https://github.com/elizaOS/community-plugins/tree/develop/packages/plugin-goat) |
| GAME | [game-node](https://github.com/game-by-virtuals/game-node/tree/main/plugins/onChainActionsPlugin) | [game-python](https://github.com/game-by-virtuals/game-python/tree/main/plugins/onchain_actions)
| ZerePy | | [ZerePy](https://github.com/blorm-network/ZerePy/blob/main/src/connections/goat_connection.py) |



# 💻 Contributing
Do you want a protocol, chain, wallet or agent framework to be supported?

See guides on how to do that here:
| Guide |  |  |
| --- | --- | --- |
| How to set up the project locally | [Typescript](https://github.com/goat-sdk/goat/tree/main/typescript/docs/2-set-up-the-project-locally.md) | [Python](https://github.com/goat-sdk/goat/tree/main/python/docs/2-set-up-the-project-locally.md) |
| How to create a plugin | [Typescript](https://github.com/goat-sdk/goat/tree/main/typescript/docs/3-create-a-plugin.md) | [Python](https://github.com/goat-sdk/goat/tree/main/python/docs/3-create-a-plugin.md) |
| How to add a new chain | [Typescript](https://github.com/goat-sdk/goat/tree/main/typescript/docs/4-add-a-new-chain.md) | [Python](https://github.com/goat-sdk/goat/tree/main/python/docs/4-add-a-new-chain.md) |
| How to add a new wallet provider | [Typescript](https://github.com/goat-sdk/goat/tree/main/typescript/docs/5-add-a-wallet-provider.md) | [Python](https://github.com/goat-sdk/goat/tree/main/python/docs/5-add-a-wallet-provider.md) |

# 🤝 Community
- Follow us on [X](https://x.com/goat_sdk)
- Join our [Discord](https://discord.gg/goat-sdk)

