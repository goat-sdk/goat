

<div align="center">
Go out and eat some grass.

[Docs](https://ohmygoat.dev) | [Examples](https://github.com/goat-sdk/goat/tree/main/typescript/examples) | [Discord](https://discord.gg/goat-sdk)

GOAT is sponsored by [Crossmint](https://www.crossmint.com)
</div>

## Goat 🐐
GOAT 🐐 (Great Onchain Agent Toolkit) is an open-source framework for adding blockchain tools such as wallets, being able to hold or trade tokens, or interacting with blockchain smart contracts, to your AI agent.

**Problem**: 

Making agents perform onchain actions is tedious. The ecosystem is heavily fragmented, spanning 5+ popular agent development frameworks, multiple programming languages, and dozens of different blockchains and wallet architectures.
For developers without blockchain expertise, finding clear instructions to perform simple actions - like sending USDC payments or placing Polymarket bets - is nearly impossible.

**Solution**: 

GOAT solves this by providing an open-source, provider-agnostic framework that abstracts away all these combinations.

- **For agent developers**: GOAT offers an always-growing catalog of ready made blockchain actions (sending tokens, using a DeFi protocol, ...) that can be imported as tools into your existing agent. It works with the most popular agent frameworks (Langchain, Vercel's AI SDK, Eliza, etc), Typescript and Python, 30+ blockchains (Solana, Base, Polygon, Mode, ...), and many wallet providers.
- **For dApp / smart contract developers**: develop a plug-in in GOAT, and allow agents built with any of the most popular agent development frameworks to access your service.

### Key features
1. **Works Everywhere**: Compatible with Langchain, Vercel’s AI SDK, Eliza, and more.
2. **Wallet Agnostic**: Supports all wallets, from your own key pairs to [Crossmint Smart Wallets](https://docs.crossmint.com/wallets/smart-wallets/overview) and Coinbase.
3. **Multi-Chain**: Supports EVM chains and Solana (more coming 👀).
4. **Customizable**: Use or build plugins for any onchain functionality (sending tokens, checking wallet balance, etc) and protocol (Polymarket, Uniswap, etc).

![goat](https://github.com/user-attachments/assets/f6aa46ce-5684-4136-be29-7867acab3f27)

### How it works
GOAT plugs into your agents tool calling capabilities adding all the functions your agent needs to interact with the blockchain. 

High-level, here's how it works:

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

See [here](https://github.com/goat-sdk/goat/tree/main/typescript/examples) for more examples.
