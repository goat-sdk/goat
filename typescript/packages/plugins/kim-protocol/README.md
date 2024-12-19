# Goat Plugin KIM Protocol 🐐 - TypeScript

## Installation
```bash
npm install @goat-sdk/plugin-kim-protocol
```

## Description
This plugin enables AI agents to interact with KIM Protocol on Mode Network, allowing them to:
- Perform token swaps
- Provide liquidity to pools

## Usage
```typescript
import { kimProtocolPlugin } from '@goat-sdk/plugin-kim-protocol';

const tools = await getOnChainTools({
    wallet: viem(wallet),
    plugins: [
        kimProtocolPlugin(),
        // ... other plugins
    ],
});
```

## Supported Chains
- Mode Mainnet
- Mode Testnet

## Links
- [KIM Exchange](https://www.kim.exchange/)
- [Documentation](https://docs.kim.exchange/) 