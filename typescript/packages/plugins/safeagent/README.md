# @goat-sdk/plugin-safeagent

Token safety checks for GOAT agents. Detects honeypots, rug pulls, and scam tokens across 6 EVM chains.

## Usage

```typescript
import { safeagent } from "@goat-sdk/plugin-safeagent";

const tools = getOnChainTools({
    wallet: ...,
    plugins: [safeagent()],
});
```

The `check_token_safety` tool automatically checks any token before trading.

## Features
- Honeypot detection via DEX swap simulation
- 17 scam pattern checks
- LP lock verification
- 6 EVM chains (Base, Ethereum, Arbitrum, Optimism, Polygon, BSC)
- Score 0-100 with risk flags
- Sub-second response

## Standard
Implements [ERC-7913 Token Safety Score](https://github.com/CryptoGenesisSecurity/erc-token-safety-score).

Live oracles on Base + Optimism. SafeRouter on Base for automatic swap protection.
