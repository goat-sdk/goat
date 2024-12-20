# GOAT Adapter Model Context Protocol (Claude) 🐐 - TypeScript

## Installation
```
npm install @goat-sdk/adapter-model-context-protocol
```

## Usage

Check out the [viem example](https://github.com/goat-sdk/goat/tree/main/typescript/examples/model-context-protocol/viem) for a full MCP server example.

```ts
const { listOfTools, toolHandler } = await getOnChainTools({
    wallet: viem(walletClient),
    plugins: [sendETH(), erc20({ tokens: [USDC, MODE] }), kim()],
});
```

## Goat

<div align="center">
Go out and eat some grass.

[Docs](https://ohmygoat.dev) | [Examples](https://github.com/goat-sdk/goat/tree/main/typescript/examples) | [Discord](https://discord.gg/goat-sdk)</div>

## Goat 🐐
Goat 🐐 (Great Onchain Agent Toolkit) is an open-source library enabling AI agents to interact with blockchain protocols and smart contracts via their own wallets.
