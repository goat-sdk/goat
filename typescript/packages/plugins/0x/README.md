# 0x GOAT Plugin

Get quotes and swap on 0x

## Configuration
Required environment variables:
- `ZEROEX_API_KEY`: Your 0x API key
  - Get it from: https://dashboard.0x.org/
  - Format: UUID string
  - Required for: Getting quotes and executing swaps
  - See: [Environment Variables Guide](../../../docs/environment-variables.mdx)

## Installation
```bash
npm install @goat-sdk/plugin-0x
```

## Usage
```typescript
import { zeroEx } from '@goat-sdk/plugin-0x';

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
       zeroEx({
            apiKey: process.env.ZEROEX_API_KEY
       })
    ]
});
```

## Tools
* Get quote
* Swap
