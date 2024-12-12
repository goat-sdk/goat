<div align="center">
Go out and eat some grass.

[Examples](https://github.com/goat-sdk/goat/tree/main/typescript/examples) | [Contributing](./CONTRIBUTING.md)

GOAT is free software, MIT licensed, sponsored by [Crossmint](https://www.crossmint.com)
</div>

## Goat 🐐
GOAT 🐐 (Great Onchain Agent Toolkit) is an open-source framework for adding blockchain tools such as wallets, being able to hold or trade tokens, or interacting with blockchain smart contracts, to your AI agent.

**Problem**:

Making agents perform onchain actions is tedious. The ecosystem is heavily fragmented, spanning 5+ popular agent development frameworks, multiple programming languages, and dozens of different blockchains and wallet architectures.
For developers without blockchain expertise, finding clear instructions to perform simple actions - like sending USDC payments or placing Polymarket bets - is nearly impossible.

**Solution**:

GOAT solves this by providing an open-source, provider-agnostic framework that abstracts away all these combinations.

- **For agent developers**: GOAT offers an always-growing catalog of ready made blockchain actions (sending tokens, using a DeFi protocol, ...) that can be imported as tools into your existing agent. It works with the most popular agent frameworks (Langchain, Vercel's AI SDK, AutoGen, and more), Typescript and Python, and supports multiple blockchains (Solana, Base, Polygon, Mode, and others).
- **For dApp / smart contract developers**: develop a plug-in in GOAT, and allow agents built with any of the most popular agent development frameworks to access your service.

### Key features
1. **Works Everywhere**: Compatible with Langchain, Vercel's AI SDK, AutoGen, and other popular agent frameworks.
2. **Wallet Agnostic**: Supports all wallets, from your own key pairs to [Crossmint Smart Wallets](https://docs.crossmint.com/wallets/smart-wallets/overview) and Coinbase.
3. **Multi-Chain**: Currently supports EVM chains (Ethereum, Base, Polygon, Mode) and Solana.
4. **Customizable**: Use or build plugins for any onchain functionality (sending tokens, checking wallet balance, etc) and protocol (Polymarket, Uniswap, etc).

### Installation

```bash
# Using pnpm (recommended)
pnpm add @goat-sdk/core

# Using npm
npm install @goat-sdk/core

# Using yarn
yarn add @goat-sdk/core
```

### How it works
GOAT plugs into your agents tool calling capabilities adding all the functions your agent needs to interact with the blockchain.

High-level, here's how it works:

#### Configure the wallet you want to use
```typescript
import { createWalletClient, custom } from 'viem'
import { getOnChainTools } from '@goat-sdk/core'

// Connect your wallet using viem
const wallet = createWalletClient({
  transport: custom(window.ethereum)
})

const tools = getOnChainTools({
  wallet: viem(wallet),
})
```

#### Add the plugins you need to interact with the protocols you want
```typescript
import { sendETH, erc20, faucet, polymarket } from '@goat-sdk/core'

const tools = getOnChainTools({
  wallet: viem(wallet),
  plugins: [
    sendETH(),
    erc20({ tokens: [USDC, PEPE] }),
    faucet(),
    polymarket(),
    // Add more plugins as needed
  ],
})
```

#### Connect it to your agent framework of choice
```typescript
import { generateText, openai } from 'vercel-ai-sdk'
import { sendETH, erc20, faucet, polymarket } from '@goat-sdk/core'

// Connect your wallet using viem
const wallet = createWalletClient({
  transport: custom(window.ethereum)
})

const tools = getOnChainTools({
  wallet: viem(wallet),
  plugins: [
    sendETH(),
    erc20({ tokens: [USDC, PEPE] }),
    faucet(),
    polymarket(),
    // Add more plugins as needed
  ],
})

// Vercel's AI SDK
const result = await generateText({
    model: openai("gpt-4"),
    tools: tools,
    maxSteps: 5,
    prompt: "Send 420 ETH to ohmygoat.eth",
});
```

### Troubleshooting

If you encounter any issues:
1. Check our [examples directory](https://github.com/goat-sdk/goat/tree/main/typescript/examples) for reference implementations
2. Open an [issue](https://github.com/goat-sdk/goat/issues) on GitHub
3. Review our [Contributing Guidelines](./CONTRIBUTING.md) if you'd like to help improve GOAT

See [examples](https://github.com/goat-sdk/goat/tree/main/typescript/examples) for more implementation examples.
