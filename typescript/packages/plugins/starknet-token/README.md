# @goat/starknet-token

A Goat plugin for interacting with tokens on the Starknet blockchain.

## Features

- Support for ERC20 tokens on Starknet
- Balance checking
- Token transfers
- Allowance management (approve/check allowance)
- Pre-configured common tokens (ETH, USDC, STRK)
- Support for mainnet network for now

## Installation

```bash
npm install @goat/starknet-token
```
## Usage
```typescript
import { starknetToken, STARKNET_TOKENS } from "@goat-sdk/plugin-starknet-token";

const plugin = starknetToken({ tokens: STARKNET_TOKENS });
```

## Working example
See the [Vercel AI example](https://github.com/MahmoudMohajer/goat/tree/starknet_demo/typescript/examples/vercel-ai/avnu) for a working example of how to use the Starknet Token plugin.
## Supported Networks

- Mainnet

## Pre-configured Tokens

- ETH (Ether)
- USDC (USD Coin)
- STRK (Starknet Token)
- EKUBO (Ekubo Token)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 