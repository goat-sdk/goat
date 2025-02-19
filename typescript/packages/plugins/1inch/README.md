# 1inch GOAT Plugin

Get balances for different tokens for a wallet using the 1inch API.

## Configuration
Required environment variables:
- `ONEINCH_API_KEY`: Your 1inch API key
  - Get it from: https://portal.1inch.dev
  - Format: 32-character string
  - Required for: Accessing token balances and swap quotes
  - See: [Environment Variables Guide](../../../docs/environment-variables.mdx)

## Installation
```bash
npm install @goat-sdk/plugin-1inch
```

## Usage
```typescript
import { oneInch } from '@goat-sdk/plugin-1inch';

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
       oneInch({
            apiKey: process.env.ONEINCH_API_KEY
       })
    ]
});
```

## Tools
* Get balances
