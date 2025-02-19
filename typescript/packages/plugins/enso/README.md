
# Enso GOAT Plugin

Get access to 180+ protocols through Enso for onchain actions, such as swap, deposit, lend, borrow etc.

## Installation

```bash
npm install @goat-sdk/plugin-enso
```

## Usage

```typescript
import { enso } from '@goat-sdk/plugin-enso';

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
       enso({
            apiKey: process.env.ENSO_API_KEY
       })
    ]
});
```

## Tools

* Route
* Check Approval
