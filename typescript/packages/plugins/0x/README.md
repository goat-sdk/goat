# 0x GOAT Plugin

Get quotes and swap on 0x

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
