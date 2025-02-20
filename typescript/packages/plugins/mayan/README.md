# Mayan GOAT Plugin

Cross-chain token swap using Mayan SDK (Solana, EVM, SUI)

## Installation
```bash
npm install @goat-sdk/plugin-mayan
```

## Usage
```typescript
import { mayan } from '@goat-sdk/plugin-mayan';

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
       mayan()
    ]
});
```

## Tools
- Swap from Solana to Solana, EVM, SUI
- Swap from EVM to EVM, Solana, SUI
